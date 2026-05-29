alter table public.courses
  add column if not exists deleted_at timestamptz,
  add column if not exists deleted_by uuid references public.profiles(id) on delete set null;

create index if not exists courses_deleted_at_idx on public.courses(deleted_at);

create or replace function public.is_course_deleted(course_identifier text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.courses
    where (id::text = course_identifier or slug = course_identifier)
      and deleted_at is not null
  );
$$;

drop policy if exists "Published courses are readable" on public.courses;
create policy "Published courses are readable"
on public.courses for select
using (
  (is_published = true and deleted_at is null)
  or public.is_admin()
);

drop policy if exists "Published lessons are readable" on public.lessons;
create policy "Published lessons are readable"
on public.lessons for select
using (
  exists (
    select 1 from public.courses
    where courses.id = lessons.course_id
      and courses.is_published = true
      and courses.deleted_at is null
  )
  or public.is_admin()
);

drop policy if exists "Published quizzes are readable" on public.quizzes;
create policy "Published quizzes are readable"
on public.quizzes for select
using (
  exists (
    select 1 from public.courses
    where courses.id = quizzes.course_id
      and courses.is_published = true
      and courses.deleted_at is null
  )
  or public.is_admin()
);

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
      and courses.deleted_at is null
  )
  or public.is_admin()
);

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
      and courses.deleted_at is null
  )
  or public.is_admin()
);

drop policy if exists "Published modules are readable" on public.modules;
create policy "Published modules are readable"
on public.modules for select
using (
  (
    status = 'published'
    and exists (
      select 1 from public.courses
      where courses.id = modules.course_id
        and courses.status = 'published'
        and courses.deleted_at is null
    )
  )
  or public.is_admin()
);
