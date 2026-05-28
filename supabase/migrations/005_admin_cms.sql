do $$
begin
  create type public.course_status as enum ('draft', 'published', 'archived');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.course_access_type as enum ('free', 'premium', 'single_purchase');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.content_status as enum ('draft', 'published', 'archived');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.media_asset_type as enum ('image', 'video', 'pdf');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.entitlement_source as enum ('manual', 'stripe', 'paypal', 'apple', 'google');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.entitlement_status as enum ('active', 'expired', 'revoked');
exception
  when duplicate_object then null;
end $$;

alter table public.profiles
  add column if not exists email text;

alter table public.courses
  add column if not exists short_description text,
  add column if not exists status public.course_status not null default 'published',
  add column if not exists access_type public.course_access_type not null default 'premium',
  add column if not exists price_cents integer,
  add column if not exists cover_image_url text,
  add column if not exists sort_order integer not null default 0;

update public.courses
set
  short_description = coalesce(short_description, left(description, 180)),
  status = case when is_published then 'published'::public.course_status else 'draft'::public.course_status end,
  sort_order = position
where short_description is null
   or sort_order = 0;

create table if not exists public.modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  description text,
  sort_order integer not null default 0,
  status public.content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.lessons
  add column if not exists module_id uuid references public.modules(id) on delete set null,
  add column if not exists content_text text,
  add column if not exists pdf_url text,
  add column if not exists image_url text,
  add column if not exists estimated_minutes integer not null default 10,
  add column if not exists is_preview boolean not null default false,
  add column if not exists status public.content_status not null default 'published',
  add column if not exists sort_order integer not null default 0;

update public.lessons
set
  content_text = coalesce(content_text, body),
  pdf_url = coalesce(pdf_url, pdf_path),
  estimated_minutes = duration_minutes,
  sort_order = position
where content_text is null
   or estimated_minutes = 10
   or sort_order = 0;

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type public.media_asset_type not null,
  url text not null,
  description text,
  created_at timestamptz not null default now()
);

alter table public.quizzes
  add column if not exists module_id uuid references public.modules(id) on delete set null,
  add column if not exists lesson_id uuid references public.lessons(id) on delete set null,
  add column if not exists description text,
  add column if not exists status public.content_status not null default 'published';

alter table public.questions
  add column if not exists question_text text,
  add column if not exists explanation text,
  add column if not exists sort_order integer not null default 0;

update public.questions
set
  question_text = coalesce(question_text, prompt),
  sort_order = position
where question_text is null
   or sort_order = 0;

alter table public.answers
  add column if not exists sort_order integer not null default 0;

update public.answers
set sort_order = position
where sort_order = 0;

create table if not exists public.entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  source public.entitlement_source not null default 'manual',
  status public.entitlement_status not null default 'active',
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists modules_course_id_idx on public.modules(course_id);
create index if not exists lessons_module_id_idx on public.lessons(module_id);
create index if not exists media_assets_type_idx on public.media_assets(type);
create index if not exists entitlements_user_course_idx on public.entitlements(user_id, course_id);
create index if not exists entitlements_active_idx on public.entitlements(user_id, course_id, status);

drop trigger if exists set_modules_updated_at on public.modules;
create trigger set_modules_updated_at
before update on public.modules
for each row execute function public.set_updated_at();

drop trigger if exists set_entitlements_updated_at on public.entitlements;
create trigger set_entitlements_updated_at
before update on public.entitlements
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    'student'
  )
  on conflict (id) do update
  set
    email = coalesce(public.profiles.email, excluded.email),
    full_name = coalesce(public.profiles.full_name, excluded.full_name);
  return new;
end;
$$;

alter table public.modules enable row level security;
alter table public.media_assets enable row level security;
alter table public.entitlements enable row level security;

drop policy if exists "Published modules are readable" on public.modules;
create policy "Published modules are readable"
on public.modules for select
using (
  status = 'published'
  and exists (
    select 1 from public.courses
    where courses.id = modules.course_id
      and courses.status = 'published'
  )
  or public.is_admin()
);

drop policy if exists "Admins manage modules" on public.modules;
create policy "Admins manage modules"
on public.modules for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Published media assets are readable" on public.media_assets;
create policy "Published media assets are readable"
on public.media_assets for select
using (auth.role() = 'authenticated' or public.is_admin());

drop policy if exists "Admins manage media assets" on public.media_assets;
create policy "Admins manage media assets"
on public.media_assets for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Users read own entitlements" on public.entitlements;
create policy "Users read own entitlements"
on public.entitlements for select
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "Admins manage entitlements" on public.entitlements;
create policy "Admins manage entitlements"
on public.entitlements for all
using (public.is_admin())
with check (public.is_admin());

insert into storage.buckets (id, name, public)
values ('course-media', 'course-media', true)
on conflict (id) do nothing;

drop policy if exists "Authenticated users read course media" on storage.objects;
create policy "Authenticated users read course media"
on storage.objects for select
to authenticated
using (bucket_id = 'course-media');

drop policy if exists "Admins upload course media" on storage.objects;
create policy "Admins upload course media"
on storage.objects for insert
to authenticated
with check (bucket_id = 'course-media' and public.is_admin());

drop policy if exists "Admins update course media" on storage.objects;
create policy "Admins update course media"
on storage.objects for update
to authenticated
using (bucket_id = 'course-media' and public.is_admin())
with check (bucket_id = 'course-media' and public.is_admin());

drop policy if exists "Admins delete course media" on storage.objects;
create policy "Admins delete course media"
on storage.objects for delete
to authenticated
using (bucket_id = 'course-media' and public.is_admin());
