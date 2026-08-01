revoke all on function public.reward_post_entry(uuid,reward_entry_direction,bigint,reward_entry_status,reward_source,text,text,jsonb) from public, anon, authenticated;
grant execute on function public.reward_post_entry(uuid,reward_entry_direction,bigint,reward_entry_status,reward_source,text,text,jsonb) to service_role;
revoke all on function public.is_reward_tenant_member(uuid) from public, anon;
grant execute on function public.is_reward_tenant_member(uuid) to authenticated, service_role;