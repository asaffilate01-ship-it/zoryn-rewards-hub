create table if not exists public.zr_release_security_evidence (
  id uuid primary key default gen_random_uuid(),
  release_name text not null,
  environment text not null,
  evidence_type text not null check (evidence_type in ('ci','tenant_isolation','role_isolation','ledger_invariant','qr_replay','backup_restore','penetration_test')),
  status text not null check (status in ('passed','failed','blocked')),
  details jsonb not null default '{}'::jsonb,
  evidence_reference text,
  executed_at timestamptz not null default now(),
  executed_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists zr_release_security_evidence_release_idx on public.zr_release_security_evidence(release_name, executed_at desc);
grant select on public.zr_release_security_evidence to authenticated;
grant all on public.zr_release_security_evidence to service_role;
alter table public.zr_release_security_evidence enable row level security;
drop policy if exists zr_release_security_evidence_admin_read on public.zr_release_security_evidence;
create policy zr_release_security_evidence_admin_read on public.zr_release_security_evidence
  for select to authenticated
  using (public.has_role(auth.uid(), 'admin'::public.app_role));
drop trigger if exists zr_release_security_evidence_updated_at on public.zr_release_security_evidence;
create trigger zr_release_security_evidence_updated_at
  before update on public.zr_release_security_evidence
  for each row execute function public.set_updated_at();

create table if not exists public.zr_release_blockers (
  id uuid primary key default gen_random_uuid(),
  area text not null check (area in ('engineering','security','operations','billing','affiliate','mobile','legal','pilot')),
  severity text not null check (severity in ('warning','critical')),
  title text not null,
  details text,
  status text not null default 'open' check (status in ('open','accepted','resolved')),
  owner text,
  due_at timestamptz,
  evidence_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz
);
create index if not exists zr_release_blockers_status_idx on public.zr_release_blockers(status, severity, created_at desc);
grant select on public.zr_release_blockers to authenticated;
grant all on public.zr_release_blockers to service_role;
alter table public.zr_release_blockers enable row level security;
drop policy if exists zr_release_blockers_admin_read on public.zr_release_blockers;
create policy zr_release_blockers_admin_read on public.zr_release_blockers
  for select to authenticated
  using (public.has_role(auth.uid(), 'admin'::public.app_role));
drop trigger if exists zr_release_blockers_updated_at on public.zr_release_blockers;
create trigger zr_release_blockers_updated_at
  before update on public.zr_release_blockers
  for each row execute function public.set_updated_at();