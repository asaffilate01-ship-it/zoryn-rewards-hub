create or replace function public.reward_ensure_membership(_tenant uuid, _user uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  select id into v_id from public.reward_memberships where tenant_id=_tenant and platform_user_id=_user limit 1;
  if v_id is not null then return v_id; end if;
  insert into public.reward_memberships(tenant_id, platform_user_id, membership_number)
  values(_tenant, _user, 'ZR-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,10)))
  returning id into v_id;
  return v_id;
end $$;

create or replace function public.reward_ensure_wallet(_membership uuid, _programme uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  select id into v_id from public.reward_wallets where membership_id=_membership and programme_id=_programme limit 1;
  if v_id is not null then return v_id; end if;
  insert into public.reward_wallets(membership_id, programme_id) values(_membership, _programme) returning id into v_id;
  return v_id;
end $$;

create or replace function public.reward_process_event(_event_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_event public.reward_external_events%rowtype;
  v_membership uuid;
  v_programme public.reward_programmes%rowtype;
  v_wallet uuid;
  v_campaign public.reward_campaigns%rowtype;
  v_ppe numeric := 1;
  v_wallet_kind text := 'universal';
  v_amount bigint;
  v_entry uuid;
  v_source public.reward_source;
begin
  select * into v_event from public.reward_external_events where id=_event_id for update;
  if not found then return jsonb_build_object('ok', false, 'reason', 'event_not_found'); end if;
  if v_event.status = 'processed' then return jsonb_build_object('ok', true, 'reason', 'already_processed'); end if;

  update public.reward_external_events
    set status='processing', attempts = attempts + 1, error = null
    where id=_event_id;

  if v_event.platform_user_id is null or coalesce(v_event.amount_cents,0) <= 0 then
    update public.reward_external_events set status='ignored', processed_at=now(),
      error='missing_user_or_amount' where id=_event_id;
    return jsonb_build_object('ok', false, 'reason', 'missing_user_or_amount');
  end if;

  select c.* into v_campaign
  from public.reward_campaigns c
  where c.tenant_id = v_event.tenant_id
    and c.status = 'active'
    and c.campaign_type = 'earn'
    and (c.starts_at is null or c.starts_at <= now())
    and (c.ends_at is null or c.ends_at >= now())
    and (c.trigger_rules->>'source' is null or c.trigger_rules->>'source' = v_event.provider)
    and coalesce((c.trigger_rules->>'minimum_amount_cents')::bigint, 0) <= v_event.amount_cents
  order by coalesce((c.reward_rules->>'points_per_euro')::numeric, 1) desc
  limit 1;

  if found then
    v_ppe := coalesce((v_campaign.reward_rules->>'points_per_euro')::numeric, 1);
    v_wallet_kind := coalesce(v_campaign.reward_rules->>'wallet', 'universal');
  end if;

  select p.* into v_programme
  from public.reward_programmes p
  where p.tenant_id = v_event.tenant_id
    and p.status = 'active'
    and p.programme_type = v_wallet_kind
  limit 1;

  if not found then
    select p.* into v_programme from public.reward_programmes p
    where p.tenant_id = v_event.tenant_id and p.status='active'
    order by p.created_at limit 1;
  end if;

  if not found then
    update public.reward_external_events set status='failed', error='no_active_programme' where id=_event_id;
    return jsonb_build_object('ok', false, 'reason', 'no_active_programme');
  end if;

  v_amount := floor((v_event.amount_cents::numeric / 100) * v_ppe);
  if v_programme.currency = 'cashback_cents' then
    v_amount := floor(v_event.amount_cents::numeric * v_ppe / 100);
  end if;
  if v_amount <= 0 then
    update public.reward_external_events set status='ignored', processed_at=now(),
      error='reward_rounds_to_zero' where id=_event_id;
    return jsonb_build_object('ok', false, 'reason', 'reward_rounds_to_zero');
  end if;

  v_membership := public.reward_ensure_membership(v_event.tenant_id, v_event.platform_user_id);
  v_wallet := public.reward_ensure_wallet(v_membership, v_programme.id);

  v_source := case when v_event.provider in
      ('card','payment','qr','affiliate','referral','campaign','manual','gift_card','loungetech_app','adjustment')
    then v_event.provider::public.reward_source else 'manual'::public.reward_source end;

  v_entry := public.reward_post_entry(
    v_wallet, 'credit'::public.reward_entry_direction, v_amount,
    'available'::public.reward_entry_status, v_source,
    v_event.provider || ':' || v_event.provider_event_id,
    coalesce(v_campaign.name, 'Base reward'),
    jsonb_build_object('event_id', v_event.id, 'campaign_id', v_campaign.id)
  );

  insert into public.reward_attributions(
    event_id, campaign_id, membership_id, wallet_id, reward_amount,
    reward_value_cents, funding_source, ledger_entry_id)
  values(
    v_event.id, v_campaign.id, v_membership, v_wallet, v_amount,
    case when v_programme.currency = 'cashback_cents' then v_amount else floor(v_amount/100.0) end,
    coalesce(v_campaign.budget->>'funding_source', 'tenant'), v_entry);

  update public.reward_external_events set status='processed', processed_at=now(), error=null where id=_event_id;
  update public.reward_outbox set status='processed' where aggregate_id=v_event.id and status='pending';

  return jsonb_build_object('ok', true, 'entry_id', v_entry, 'wallet_id', v_wallet, 'amount', v_amount);
exception when others then
  update public.reward_external_events set status='failed', error=sqlerrm where id=_event_id;
  return jsonb_build_object('ok', false, 'reason', sqlerrm);
end $$;

revoke all on function public.reward_process_event(uuid) from public, anon, authenticated;
revoke all on function public.reward_ensure_membership(uuid, uuid) from public, anon, authenticated;
revoke all on function public.reward_ensure_wallet(uuid, uuid) from public, anon, authenticated;
grant execute on function public.reward_process_event(uuid) to service_role;
grant execute on function public.reward_ensure_membership(uuid, uuid) to service_role;
grant execute on function public.reward_ensure_wallet(uuid, uuid) to service_role;