-- Baseline for objects created before migration tracking started:
-- cuenta, empresa, set_updated_at(), handle_new_user() and the
-- on_auth_user_created trigger on auth.users. Every later migration assumes
-- they exist (20260712205056 references empresa). Captured from the live DB
-- on 2026-10-02 (threat-model item 8).
--
-- Every statement is guarded, so running this against the live DB is a
-- no-op; on a fresh database it recreates the objects as they exist today.
-- empresa_rut_check is NOT here: 20260719073000 adds it.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.cuenta (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  nombre text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.empresa (
  id uuid primary key default gen_random_uuid(),
  cuenta_id uuid not null references public.cuenta(id) on delete cascade,
  nombre text not null,
  rut text not null,
  estado text not null default 'Pendiente'
    constraint empresa_estado_check check (estado = any (array['Operativa', 'Pendiente'])),
  responsable text,
  ultimo_movimiento text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint empresa_cuenta_rut_unique unique (cuenta_id, rut)
);

create index if not exists idx_empresa_cuenta_id on public.empresa (cuenta_id);
create index if not exists idx_empresa_nombre on public.empresa (nombre);
create index if not exists idx_empresa_rut on public.empresa (rut);

alter table public.cuenta enable row level security;
alter table public.empresa enable row level security;

-- Tenant isolation root: every other business table scopes rows through
-- empresa.cuenta_id = auth.uid().
do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'cuenta' and policyname = 'cuenta_select_own') then
    create policy cuenta_select_own on public.cuenta
      for select using (id = (select auth.uid()));
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'cuenta' and policyname = 'cuenta_update_own') then
    create policy cuenta_update_own on public.cuenta
      for update using (id = (select auth.uid())) with check (id = (select auth.uid()));
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'empresa' and policyname = 'empresa_select_own') then
    create policy empresa_select_own on public.empresa
      for select using (cuenta_id = (select auth.uid()));
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'empresa' and policyname = 'empresa_insert_own') then
    create policy empresa_insert_own on public.empresa
      for insert with check (cuenta_id = (select auth.uid()));
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'empresa' and policyname = 'empresa_update_own') then
    create policy empresa_update_own on public.empresa
      for update using (cuenta_id = (select auth.uid())) with check (cuenta_id = (select auth.uid()));
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'empresa' and policyname = 'empresa_delete_own') then
    create policy empresa_delete_own on public.empresa
      for delete using (cuenta_id = (select auth.uid()));
  end if;
end;
$$;

-- Creates the cuenta row on sign-up. security definer because the inserting
-- role (supabase_auth_admin) has no RLS policy on cuenta. Not callable via
-- RPC (returns trigger); EXECUTE is limited to postgres and service_role.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.cuenta (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'cuenta_set_updated_at' and tgrelid = 'public.cuenta'::regclass) then
    create trigger cuenta_set_updated_at before update on public.cuenta
      for each row execute function public.set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'empresa_set_updated_at' and tgrelid = 'public.empresa'::regclass) then
    create trigger empresa_set_updated_at before update on public.empresa
      for each row execute function public.set_updated_at();
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'on_auth_user_created' and tgrelid = 'auth.users'::regclass) then
    create trigger on_auth_user_created after insert on auth.users
      for each row execute function public.handle_new_user();
  end if;
end;
$$;
