import {
  createCourse,
  createLesson,
  createQuestion,
  deleteCourse,
  deleteLesson,
  deleteQuestion,
  updateCourse,
  updateLesson,
  upsertQuiz
} from "@/app/actions";
import { EmptyState } from "@/components/empty-state";
import { PageHeading } from "@/components/page-heading";
import { requireAdmin } from "@/lib/auth";
import { getAdminCourses } from "@/lib/queries";
import type { AdminCourse } from "@/lib/queries";

function TextInput({
  label,
  name,
  defaultValue,
  type = "text",
  required = false
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block space-y-2">
      <span className="label">{label}</span>
      <input className="field" type={type} name={name} defaultValue={defaultValue ?? ""} required={required} />
    </label>
  );
}

function TextArea({
  label,
  name,
  defaultValue,
  rows = 4,
  required = false
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  rows?: number;
  required?: boolean;
}) {
  return (
    <label className="block space-y-2">
      <span className="label">{label}</span>
      <textarea className="field min-h-28" name={name} rows={rows} defaultValue={defaultValue ?? ""} required={required} />
    </label>
  );
}

function CourseForm({ course }: { course?: AdminCourse }) {
  const action = course ? updateCourse.bind(null, course.id) : createCourse;

  return (
    <form action={action} className="grid gap-4 md:grid-cols-2">
      <TextInput label="Titel" name="title" defaultValue={course?.title} required />
      <TextInput label="Slug" name="slug" defaultValue={course?.slug} />
      <TextInput label="Kategorie" name="category" defaultValue={course?.category} required />
      <TextInput label="Position" name="position" type="number" defaultValue={course?.position ?? 0} />
      <div className="md:col-span-2">
        <TextArea label="Beschreibung" name="description" defaultValue={course?.description} required />
      </div>
      <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
        <input className="h-4 w-4 accent-brand" type="checkbox" name="is_published" defaultChecked={course?.is_published ?? true} />
        Veröffentlicht
      </label>
      <div className="md:col-span-2">
        <button className="btn-primary" type="submit">
          {course ? "Kurs speichern" : "Kurs anlegen"}
        </button>
      </div>
    </form>
  );
}

function LessonForm({ courseId, lesson }: { courseId: string; lesson?: AdminCourse["lessons"][number] }) {
  const action = lesson ? updateLesson.bind(null, courseId, lesson.id) : createLesson.bind(null, courseId);

  return (
    <form action={action} encType="multipart/form-data" className="grid gap-4 md:grid-cols-2">
      <TextInput label="Titel" name="title" defaultValue={lesson?.title} required />
      <TextInput label="Slug" name="slug" defaultValue={lesson?.slug} />
      <TextInput label="Position" name="position" type="number" defaultValue={lesson?.position ?? 0} />
      <TextInput label="Dauer in Minuten" name="duration_minutes" type="number" defaultValue={lesson?.duration_minutes ?? 10} />
      <div className="md:col-span-2">
        <TextInput label="Video-URL" name="video_url" defaultValue={lesson?.video_url} />
      </div>
      <div className="md:col-span-2">
        <TextArea label="Kurzbeschreibung" name="description" defaultValue={lesson?.description} rows={3} />
      </div>
      <div className="md:col-span-2">
        <TextArea label="Lektionstext" name="body" defaultValue={lesson?.body} rows={6} />
      </div>
      <label className="block space-y-2 md:col-span-2">
        <span className="label">PDF-Datei</span>
        <input className="field" type="file" name="pdf" accept="application/pdf" />
        {lesson?.pdf_path ? <span className="block text-xs font-semibold text-slate-500">Aktuell: {lesson.pdf_path}</span> : null}
      </label>
      <div className="md:col-span-2">
        <button className="btn-primary" type="submit">
          {lesson ? "Lektion speichern" : "Lektion anlegen"}
        </button>
      </div>
    </form>
  );
}

function QuizPanel({ course }: { course: AdminCourse }) {
  const quizAction = upsertQuiz.bind(null, course.id);

  return (
    <div className="space-y-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div>
        <h3 className="text-lg font-bold text-ink">Quiz</h3>
        <p className="text-sm leading-6 text-slate-600">Ein Multiple-Choice-Quiz pro Kurs. Ergebnisse werden in Supabase gespeichert.</p>
      </div>

      <form action={quizAction} className="grid gap-4 md:grid-cols-[1fr_180px_auto] md:items-end">
        <TextInput label="Quiztitel" name="title" defaultValue={course.quiz?.title || "Abschlussquiz"} required />
        <TextInput label="Bestehen ab %" name="passing_score" type="number" defaultValue={course.quiz?.passing_score ?? 70} />
        <button className="btn-primary" type="submit">
          Quiz speichern
        </button>
      </form>

      {course.quiz ? (
        <div className="space-y-5">
          <form action={createQuestion.bind(null, course.id, course.quiz.id)} className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
            <TextInput label="Frage" name="prompt" required />
            <TextInput label="Position" name="position" type="number" defaultValue={course.quiz.questions.length + 1} />
            <div className="grid gap-4 md:grid-cols-2">
              {[0, 1, 2, 3].map((index) => (
                <label key={index} className="block space-y-2">
                  <span className="label">Antwort {index + 1}</span>
                  <input className="field" type="text" name={`answer_${index}`} required={index < 2} />
                  <span className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                    <input className="h-4 w-4 accent-brand" type="radio" name="correct_answer" value={index} defaultChecked={index === 0} />
                    Richtige Antwort
                  </span>
                </label>
              ))}
            </div>
            <button className="btn-primary" type="submit">
              Frage anlegen
            </button>
          </form>

          {course.quiz.questions.length ? (
            <div className="space-y-3">
              {course.quiz.questions.map((question) => (
                <div key={question.id} className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-bold text-ink">{question.prompt}</p>
                      <ul className="mt-2 space-y-1 text-sm text-slate-600">
                        {question.answers.map((answer) => (
                          <li key={answer.id}>
                            {answer.is_correct ? "✓ " : ""}
                            {answer.answer_text}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <form action={deleteQuestion.bind(null, course.id, question.id)}>
                      <button className="btn-danger" type="submit">
                        Frage löschen
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export default async function AdminPage() {
  await requireAdmin();
  const courses = await getAdminCourses();

  return (
    <section className="container-shell py-8 sm:py-12">
      <div className="space-y-8">
        <PageHeading
          eyebrow="Admin"
          title="SimplyLaw Campus verwalten"
          description="Kurse, Lektionen, PDF-Dateien, Video-URLs und Quizfragen für das MVP pflegen."
        />

        <div className="card p-5 sm:p-6">
          <h2 className="text-2xl font-bold text-ink">Neuen Kurs anlegen</h2>
          <div className="mt-5">
            <CourseForm />
          </div>
        </div>

        {courses.length ? (
          <div className="space-y-5">
            {courses.map((course) => (
              <article key={course.id} className="card p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-bold text-brand">{course.category}</p>
                    <h2 className="mt-1 text-2xl font-bold text-ink">{course.title}</h2>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{course.description}</p>
                  </div>
                  <form action={deleteCourse.bind(null, course.id)}>
                    <button className="btn-danger" type="submit">
                      Kurs löschen
                    </button>
                  </form>
                </div>

                <div className="mt-6 space-y-4">
                  <details className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <summary className="cursor-pointer text-lg font-bold text-ink">Kurs bearbeiten</summary>
                    <div className="mt-4">
                      <CourseForm course={course} />
                    </div>
                  </details>

                  <details className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <summary className="cursor-pointer text-lg font-bold text-ink">Lektionen verwalten</summary>
                    <div className="mt-4 space-y-5">
                      <div className="rounded-lg border border-slate-200 bg-white p-4">
                        <h3 className="text-lg font-bold text-ink">Neue Lektion</h3>
                        <div className="mt-4">
                          <LessonForm courseId={course.id} />
                        </div>
                      </div>

                      {course.lessons.map((lesson) => (
                        <details key={lesson.id} className="rounded-lg border border-slate-200 bg-white p-4">
                          <summary className="cursor-pointer font-bold text-ink">
                            {lesson.position}. {lesson.title}
                          </summary>
                          <div className="mt-4 space-y-4">
                            <LessonForm courseId={course.id} lesson={lesson} />
                            <form action={deleteLesson.bind(null, course.id, lesson.id)}>
                              <button className="btn-danger" type="submit">
                                Lektion löschen
                              </button>
                            </form>
                          </div>
                        </details>
                      ))}
                    </div>
                  </details>

                  <QuizPanel course={course} />
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState title="Noch keine Kurse" description="Lege den ersten Kurs über das Formular oben an." />
        )}
      </div>
    </section>
  );
}
