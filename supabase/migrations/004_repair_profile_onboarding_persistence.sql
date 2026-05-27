alter table public.profiles
  add column if not exists username text,
  add column if not exists avatar_url text,
  add column if not exists level text,
  add column if not exists federal_state text,
  add column if not exists agency text,
  add column if not exists activity_area text,
  add column if not exists onboarding_completed boolean;

alter table public.profiles
  alter column onboarding_completed set default false;

update public.profiles
set onboarding_completed = false
where onboarding_completed is null;

alter table public.profiles
  alter column onboarding_completed set not null;

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile"
on public.profiles for update
using (id = auth.uid())
with check (id = auth.uid() and (role = 'student' or public.is_admin()));
