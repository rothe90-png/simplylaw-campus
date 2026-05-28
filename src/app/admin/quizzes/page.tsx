import { createAdminQuiz } from "@/app/actions";
import { AdminSelect, AdminSubmitButton, AdminTextArea, AdminTextInput } from "@/components/admin/admin-fields";
import { AdminKicker, AdminPanel, AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/auth";
import { getAdminQuizRows } from "@/lib/queries";

export default async function AdminQuizzesPage() {
  const context = await requireAdmin();
  const { profile, user, supabase } = context;
  const [quizzes, coursesResponse, modulesResponse, lessonsResponse] = await Promise.all([
    getAdminQuizRows(),
    supabase.from("courses").select("id,title").order("sort_order", { ascending: true }),
    supabase.from("modules").select("id,title,course_id").order("sort_order", { ascending: true }),
    supabase.from("lessons").select("id,title,course_id").order("sort_order", { ascending: true })
  ]);

  if (coursesResponse.error) throw coursesResponse.error;
  if (modulesResponse.error) throw modulesResponse.error;
  if (lessonsResponse.error) throw lessonsResponse.error;

  const courses = coursesResponse.data ?? [];
  const modules = modulesResponse.data ?? [];
  const lessons = lessonsResponse.data ?? [];
  const name = profile.username || profile.full_name || user.email?.split("@")[0] || "Admin";

  return (
    <AdminShell userName={name} active="quizzes">
      <section className="space-y-6">
        <div>
          <AdminKicker>Quiz-Verwaltung</AdminKicker>
          <h1 className="mt-2 text-3xl font-bold text-white">Quiz</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Quizze anlegen und dem Kurs, optional einem Modul oder einer Lektion zuordnen. Fragen und Antworten bleiben mit den
            bestehenden Tabellen vorbereitet.
          </p>
        </div>

        <AdminPanel>
          <h2 className="text-xl font-bold text-white">Neues Quiz</h2>
          <form action={createAdminQuiz} className="mt-4 grid gap-4 md:grid-cols-2">
            <AdminTextInput label="Titel" name="title" defaultValue="Abschlussquiz" required />
            <AdminTextInput label="Bestehen ab %" name="passing_score" type="number" defaultValue={70} />
            <AdminSelect label="Kurs" name="course_id" required>
              <option value="">Kurs wählen</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </AdminSelect>
            <AdminSelect label="Status" name="status" defaultValue="draft">
              <option value="draft">Entwurf</option>
              <option value="published">Veröffentlicht</option>
              <option value="archived">Archiviert</option>
            </AdminSelect>
            <AdminSelect label="Modul optional" name="module_id" defaultValue="none">
              <option value="none">Kein Modul</option>
              {modules.map((module) => (
                <option key={module.id} value={module.id}>
                  {module.title}
                </option>
              ))}
            </AdminSelect>
            <AdminSelect label="Lektion optional" name="lesson_id" defaultValue="none">
              <option value="none">Keine Lektion</option>
              {lessons.map((lesson) => (
                <option key={lesson.id} value={lesson.id}>
                  {lesson.title}
                </option>
              ))}
            </AdminSelect>
            <AdminTextArea label="Beschreibung" name="description" rows={3} className="md:col-span-2" />
            <div className="md:col-span-2">
              <AdminSubmitButton>Quiz anlegen</AdminSubmitButton>
            </div>
          </form>
        </AdminPanel>

        <div className="grid gap-4 md:grid-cols-2">
          {quizzes.map((quiz) => (
            <AdminPanel key={quiz.id}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-brand/20 px-3 py-1 text-xs font-bold text-brand-100">{quiz.status}</span>
                <span className="rounded-full bg-white/[0.07] px-3 py-1 text-xs font-bold text-slate-300">{quiz.questionsCount} Fragen</span>
              </div>
              <h2 className="mt-4 text-xl font-bold text-white">{quiz.title}</h2>
              <p className="mt-2 text-sm font-semibold text-slate-300">{quiz.courseTitle}</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">{quiz.description || "Keine Beschreibung hinterlegt."}</p>
              <p className="mt-4 text-sm font-bold text-brand-100">Bestehen ab {quiz.passing_score}%</p>
            </AdminPanel>
          ))}
        </div>

        {!quizzes.length ? (
          <AdminPanel>
            <h2 className="text-xl font-bold text-white">Noch keine Quizze</h2>
            <p className="mt-2 text-sm text-slate-400">Lege oben das erste Quiz an. Die Fragenstruktur liegt in questions/answers.</p>
          </AdminPanel>
        ) : null}
      </section>
    </AdminShell>
  );
}
