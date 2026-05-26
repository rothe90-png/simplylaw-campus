create extension if not exists pgcrypto;

do $$
begin
  create type public.user_role as enum ('student', 'admin');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.lesson_status as enum ('open', 'started', 'completed');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role public.user_role not null default 'student',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text not null,
  category text not null,
  is_published boolean not null default true,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  slug text not null,
  description text,
  body text,
  video_url text,
  pdf_path text,
  duration_minutes integer not null default 10,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (course_id, slug)
);

create table if not exists public.course_enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  unique (user_id, course_id)
);

create table if not exists public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  status public.lesson_status not null default 'open',
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  passing_score integer not null default 70 check (passing_score between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (course_id)
);

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  prompt text not null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions(id) on delete cascade,
  answer_text text not null,
  is_correct boolean not null default false,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.quiz_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  score integer not null,
  total_questions integer not null,
  passed boolean not null,
  submitted_answers jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists lessons_course_id_idx on public.lessons(course_id);
create index if not exists lesson_progress_user_course_idx on public.lesson_progress(user_id, course_id);
create index if not exists course_enrollments_user_id_idx on public.course_enrollments(user_id);
create index if not exists quiz_results_user_quiz_idx on public.quiz_results(user_id, quiz_id);
create index if not exists questions_quiz_id_idx on public.questions(quiz_id);
create index if not exists answers_question_id_idx on public.answers(question_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_courses_updated_at on public.courses;
create trigger set_courses_updated_at
before update on public.courses
for each row execute function public.set_updated_at();

drop trigger if exists set_lessons_updated_at on public.lessons;
create trigger set_lessons_updated_at
before update on public.lessons
for each row execute function public.set_updated_at();

drop trigger if exists set_lesson_progress_updated_at on public.lesson_progress;
create trigger set_lesson_progress_updated_at
before update on public.lesson_progress
for each row execute function public.set_updated_at();

drop trigger if exists set_quizzes_updated_at on public.quizzes;
create trigger set_quizzes_updated_at
before update on public.quizzes
for each row execute function public.set_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    'student'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.lessons enable row level security;
alter table public.course_enrollments enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.quizzes enable row level security;
alter table public.questions enable row level security;
alter table public.answers enable row level security;
alter table public.quiz_results enable row level security;

drop policy if exists "Profiles are visible to owner and admins" on public.profiles;
create policy "Profiles are visible to owner and admins"
on public.profiles for select
using (id = auth.uid() or public.is_admin());

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
on public.profiles for insert
with check (id = auth.uid() and role = 'student');

drop policy if exists "Admins manage profiles" on public.profiles;
create policy "Admins manage profiles"
on public.profiles for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Published courses are readable" on public.courses;
create policy "Published courses are readable"
on public.courses for select
using (is_published = true or public.is_admin());

drop policy if exists "Admins manage courses" on public.courses;
create policy "Admins manage courses"
on public.courses for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Published lessons are readable" on public.lessons;
create policy "Published lessons are readable"
on public.lessons for select
using (
  exists (
    select 1 from public.courses
    where courses.id = lessons.course_id
      and courses.is_published = true
  )
  or public.is_admin()
);

drop policy if exists "Admins manage lessons" on public.lessons;
create policy "Admins manage lessons"
on public.lessons for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Users read own enrollments" on public.course_enrollments;
create policy "Users read own enrollments"
on public.course_enrollments for select
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "Users enroll themselves" on public.course_enrollments;
create policy "Users enroll themselves"
on public.course_enrollments for insert
with check (user_id = auth.uid());

drop policy if exists "Admins manage enrollments" on public.course_enrollments;
create policy "Admins manage enrollments"
on public.course_enrollments for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Users read own lesson progress" on public.lesson_progress;
create policy "Users read own lesson progress"
on public.lesson_progress for select
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "Users create own lesson progress" on public.lesson_progress;
create policy "Users create own lesson progress"
on public.lesson_progress for insert
with check (user_id = auth.uid());

drop policy if exists "Users update own lesson progress" on public.lesson_progress;
create policy "Users update own lesson progress"
on public.lesson_progress for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Admins manage lesson progress" on public.lesson_progress;
create policy "Admins manage lesson progress"
on public.lesson_progress for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Published quizzes are readable" on public.quizzes;
create policy "Published quizzes are readable"
on public.quizzes for select
using (
  exists (
    select 1 from public.courses
    where courses.id = quizzes.course_id
      and courses.is_published = true
  )
  or public.is_admin()
);

drop policy if exists "Admins manage quizzes" on public.quizzes;
create policy "Admins manage quizzes"
on public.quizzes for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Published questions are readable" on public.questions;
create policy "Published questions are readable"
on public.questions for select
using (
  exists (
    select 1
    from public.quizzes
    join public.courses on courses.id = quizzes.course_id
    where quizzes.id = questions.quiz_id
      and courses.is_published = true
  )
  or public.is_admin()
);

drop policy if exists "Admins manage questions" on public.questions;
create policy "Admins manage questions"
on public.questions for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Published answers are readable" on public.answers;
create policy "Published answers are readable"
on public.answers for select
using (
  exists (
    select 1
    from public.questions
    join public.quizzes on quizzes.id = questions.quiz_id
    join public.courses on courses.id = quizzes.course_id
    where questions.id = answers.question_id
      and courses.is_published = true
  )
  or public.is_admin()
);

drop policy if exists "Admins manage answers" on public.answers;
create policy "Admins manage answers"
on public.answers for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Users read own quiz results" on public.quiz_results;
create policy "Users read own quiz results"
on public.quiz_results for select
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "Users create own quiz results" on public.quiz_results;
create policy "Users create own quiz results"
on public.quiz_results for insert
with check (user_id = auth.uid());

drop policy if exists "Admins manage quiz results" on public.quiz_results;
create policy "Admins manage quiz results"
on public.quiz_results for all
using (public.is_admin())
with check (public.is_admin());

insert into storage.buckets (id, name, public)
values ('lesson-files', 'lesson-files', false)
on conflict (id) do nothing;

drop policy if exists "Authenticated users read lesson files" on storage.objects;
create policy "Authenticated users read lesson files"
on storage.objects for select
to authenticated
using (bucket_id = 'lesson-files');

drop policy if exists "Admins upload lesson files" on storage.objects;
create policy "Admins upload lesson files"
on storage.objects for insert
to authenticated
with check (bucket_id = 'lesson-files' and public.is_admin());

drop policy if exists "Admins update lesson files" on storage.objects;
create policy "Admins update lesson files"
on storage.objects for update
to authenticated
using (bucket_id = 'lesson-files' and public.is_admin())
with check (bucket_id = 'lesson-files' and public.is_admin());

drop policy if exists "Admins delete lesson files" on storage.objects;
create policy "Admins delete lesson files"
on storage.objects for delete
to authenticated
using (bucket_id = 'lesson-files' and public.is_admin());
