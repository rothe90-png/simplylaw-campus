import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { submitQuiz } from "@/app/actions";
import { EmptyState } from "@/components/empty-state";
import { PageHeading } from "@/components/page-heading";
import { requireOnboardedUser } from "@/lib/auth";
import { getCourseDetail, getLatestQuizResult, getQuizForCourse } from "@/lib/queries";

type PageProps = {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ score?: string; total?: string; passed?: string }>;
};

export default async function QuizPage({ params, searchParams }: PageProps) {
  await requireOnboardedUser();
  const { courseId } = await params;
  const [course, query] = await Promise.all([getCourseDetail(courseId), searchParams]);

  if (!course) notFound();
  if (!course.enrollment) redirect(`/courses/${course.slug || course.id}`);

  const quiz = await getQuizForCourse(course.id);

  const latestResult = quiz ? await getLatestQuizResult(quiz.id) : null;
  const resultFromSubmit =
    query.score && query.total
      ? {
          score: Number(query.score),
          total: Number(query.total),
          passed: query.passed === "1"
        }
      : null;

  if (!quiz) {
    return (
      <section className="container-shell py-8 sm:py-12">
        <EmptyState title="Noch kein Quiz" description="Für diesen Kurs wurde noch kein Quiz angelegt." href={`/courses/${course.id}`} action="Zurück zum Kurs" />
      </section>
    );
  }

  const submitAction = submitQuiz.bind(null, course.id, quiz.id);

  return (
    <section className="container-shell py-8 sm:py-12">
      <div className="mx-auto max-w-3xl space-y-8">
        <PageHeading
          eyebrow={course.title}
          title={quiz.title}
          description={`Beantworte alle Multiple-Choice-Fragen. Zum Bestehen brauchst du mindestens ${quiz.passing_score}%.`}
        />

        {resultFromSubmit ? (
          <div className={`rounded-lg border p-5 ${resultFromSubmit.passed ? "border-emerald-200 bg-emerald-50 text-success" : "border-red-200 bg-red-50 text-red-700"}`}>
            <p className="text-lg font-bold">{resultFromSubmit.passed ? "Bestanden" : "Nicht bestanden"}</p>
            <p className="mt-1 text-sm font-semibold">
              Ergebnis: {resultFromSubmit.score} von {resultFromSubmit.total} richtig.
            </p>
          </div>
        ) : latestResult ? (
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
            <p className="text-sm font-bold text-slate-500">Letztes Ergebnis</p>
            <p className="mt-1 text-lg font-bold text-ink">
              {latestResult.score}/{latestResult.total_questions} richtig · {latestResult.passed ? "bestanden" : "nicht bestanden"}
            </p>
          </div>
        ) : null}

        {quiz.questions.length ? (
          <form action={submitAction} className="space-y-5">
            {quiz.questions.map((question, index) => (
              <fieldset key={question.id} className="card p-5">
                <legend className="text-lg font-bold text-ink">
                  {index + 1}. {question.prompt}
                </legend>
                <div className="mt-4 space-y-3">
                  {question.answers.map((answer) => (
                    <label key={answer.id} className="flex cursor-pointer items-start gap-3 rounded-md border border-slate-200 p-3 transition hover:border-brand">
                      <input className="mt-1 h-4 w-4 accent-brand" type="radio" name={question.id} value={answer.id} required />
                      <span className="text-sm leading-6 text-slate-700">{answer.answer_text}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}

            <div className="flex flex-col gap-3 sm:flex-row">
              <button className="btn-primary" type="submit">
                Quiz auswerten
              </button>
              <Link className="btn-secondary" href={`/courses/${course.id}`}>
                Zurück zum Kurs
              </Link>
            </div>
          </form>
        ) : (
          <EmptyState title="Noch keine Fragen" description="Im Adminbereich können Quizfragen angelegt werden." />
        )}
      </div>
    </section>
  );
}
