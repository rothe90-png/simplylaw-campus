import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/badge";
import { ButtonLink } from "@/components/button";
import { Card } from "@/components/card";
import { DashboardShell } from "@/components/dashboard-shell";
import { ProgressBar } from "@/components/progress-bar";
import { SectionTitle } from "@/components/section-title";
import { findCatalogCourse, type CourseCatalogEntry, type CourseCatalogModule, type CourseCatalogTone } from "@/lib/course-catalog";
import { requireOnboardedUser } from "@/lib/auth";
import { getCourseDetail, type CourseDetail } from "@/lib/queries";

type PageProps = {
  params: Promise<{ courseId: string }>;
};

type LessonViewStatus = "locked" | "open" | "started" | "completed";

type LessonView = {
  title: string;
  durationMinutes: number;
  status: LessonViewStatus;
  href?: string;
};

type ModuleView = {
  title: string;
  lessons: LessonView[];
};

const visualStyles: Record<CourseCatalogTone, { label: string; className: string; glow: string }> = {
  "criminal-law": {
    label: "StGB",
    className: "from-brand-700 via-brand-600 to-violet-700",
    glow: "shadow-[0_0_70px_rgba(75,84,255,0.35)]"
  },
  intervention: {
    label: "E",
    className: "from-slate-900 via-brand-900 to-slate-700",
    glow: "shadow-[0_0_70px_rgba(0,76,145,0.35)]"
  },
  traffic: {
    label: "V",
    className: "from-sky-900 via-brand-800 to-cyan-700",
    glow: "shadow-[0_0_70px_rgba(14,165,233,0.24)]"
  },
  forensics: {
    label: "K",
    className: "from-indigo-950 via-brand-900 to-slate-800",
    glow: "shadow-[0_0_70px_rgba(124,58,237,0.28)]"
  },
  method: {
    label: "§",
    className: "from-brand-900 via-slate-900 to-violet-950",
    glow: "shadow-[0_0_70px_rgba(0,76,145,0.3)]"
  }
};

const statusLabel: Record<LessonViewStatus, string> = {
  locked: "gesperrt",
  open: "offen",
  started: "begonnen",
  completed: "erledigt"
};

const statusClasses: Record<LessonViewStatus, string> = {
  locked: "border-white/10 bg-white/[0.04] text-slate-500",
  open: "border-brand/25 bg-brand/15 text-brand-100",
  started: "border-amber-300/20 bg-amber-300/10 text-amber-100",
  completed: "border-emerald-300/20 bg-emerald-300/10 text-emerald-100"
};

function fallbackModules(course: CourseDetail): CourseCatalogModule[] {
  return [
    {
      title: "Lektionen",
      lessons: course.lessons.map((lesson) => ({
        title: lesson.title,
        durationMinutes: lesson.duration_minutes || 12
      }))
    }
  ];
}

function buildModuleViews(catalog: CourseCatalogEntry | null, course: CourseDetail | null, isEnrolled: boolean): ModuleView[] {
  const modules = catalog?.modules ?? (course ? fallbackModules(course) : []);
  let lessonIndex = 0;

  return modules.map((module) => ({
    title: module.title,
    lessons: module.lessons.map((lesson) => {
      const realLesson = course?.lessons[lessonIndex];
      const status: LessonViewStatus = !isEnrolled ? "locked" : realLesson?.status ?? "open";
      const href = isEnrolled && realLesson ? `/courses/${course.id}/lessons/${realLesson.id}` : undefined;
      lessonIndex += 1;

      return {
        title: lesson.title,
        durationMinutes: lesson.durationMinutes,
        status,
        href
      };
    })
  }));
}

function LessonIcon({ status }: { status: LessonViewStatus }) {
  if (status === "completed") {
    return (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="m6 12.5 4 4L18 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (status === "locked") {
    return (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M8 10V8a4 4 0 0 1 8 0v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <rect x="6.5" y="10" width="11" height="9" rx="2" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  }

  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M8 5.5v13l10-6.5-10-6.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function LessonRow({ lesson }: { lesson: LessonView }) {
  const body = (
    <>
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border ${statusClasses[lesson.status]}`}>
        <LessonIcon status={lesson.status} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold text-white">{lesson.title}</span>
        <span className="mt-1 block text-xs font-semibold text-slate-500">{lesson.durationMinutes} Min.</span>
      </span>
      <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[0.68rem] font-black uppercase ${statusClasses[lesson.status]}`}>
        {statusLabel[lesson.status]}
      </span>
    </>
  );

  if (lesson.href) {
    return (
      <Link
        href={lesson.href}
        prefetch={false}
        className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-3 transition hover:border-brand/40 hover:bg-white/[0.08]"
      >
        {body}
      </Link>
    );
  }

  return <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3">{body}</div>;
}

function countLessons(modules: ModuleView[]) {
  return modules.reduce((sum, module) => sum + module.lessons.length, 0);
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { courseId } = await params;
  const context = await requireOnboardedUser();
  const { profile, user } = context;
  const course = await getCourseDetail(courseId);
  const catalog = findCatalogCourse(course?.slug) ?? findCatalogCourse(courseId);

  if (!course && !catalog) notFound();

  const isEnrolled = Boolean(course?.enrollment);
  const modules = buildModuleViews(catalog, course, isEnrolled);
  const totalLessons = countLessons(modules) || course?.lessonsCount || 0;
  const completedLessons = isEnrolled ? modules.flatMap((module) => module.lessons).filter((lesson) => lesson.status === "completed").length : 0;
  const progress = isEnrolled && totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const name = profile.username || profile.full_name || user.email?.split("@")[0] || "SimplyLaw";
  const title = catalog?.title || course?.title || "Kurs";
  const description = catalog?.description || course?.description || "Dieser Kurs wird vorbereitet.";
  const category = catalog?.category || course?.category || "Kurs";
  const tone = catalog?.tone || "method";
  const visual = visualStyles[tone];
  const firstOpenLesson = course?.lessons.find((lesson) => lesson.status !== "completed") || course?.lessons[0];
  const startHref = firstOpenLesson ? `/courses/${course?.id}/lessons/${firstOpenLesson.id}` : "#kursstruktur";
  const quizHref = course?.quiz && isEnrolled ? `/courses/${course.id}/quiz` : undefined;

  return (
    <DashboardShell userName={name} isAdmin={profile?.role === "admin"} active="courses">
      <section className="space-y-8">
        <Link
          href="/courses"
          prefetch={false}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-bold text-slate-300 transition hover:bg-white/[0.10] hover:text-white"
        >
          <span aria-hidden="true">←</span>
          Zurück zu den Kursen
        </Link>

        <Card className={`overflow-hidden rounded-[2rem] border-white/10 bg-white/[0.06] shadow-[0_24px_90px_rgba(0,0,0,0.34)] ${visual.glow}`}>
          <div className={`relative min-h-[21rem] overflow-hidden bg-gradient-to-br ${visual.className}`}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_18%,rgba(255,255,255,0.20),transparent_24%),linear-gradient(180deg,rgba(6,10,20,0.06),rgba(6,10,20,0.86))]" />
            <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
            <div className="relative flex min-h-[21rem] flex-col justify-between p-5 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <Badge variant={isEnrolled ? "success" : "neutral"}>{isEnrolled ? "Freigeschaltet" : "Noch nicht freigeschaltet"}</Badge>
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl border border-white/20 bg-white/15 text-xl font-black text-white shadow-[0_0_42px_rgba(255,255,255,0.16)] backdrop-blur">
                  {visual.label}
                </div>
              </div>

              <div className="max-w-3xl space-y-5">
                <div className="space-y-3">
                  <p className="text-sm font-black uppercase text-white/70">{category}</p>
                  <h1 className="text-4xl font-black leading-tight text-white sm:text-5xl">{title}</h1>
                  <p className="max-w-2xl text-base leading-7 text-slate-200">{description}</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                  <ProgressBar
                    value={progress}
                    label={`${completedLessons}/${totalLessons} Lektionen erledigt`}
                    className="rounded-3xl border border-white/10 bg-black/20 p-4 backdrop-blur"
                  />
                  {isEnrolled ? (
                    <ButtonLink href={startHref} className="rounded-full px-6" fullWidth>
                      Kurs starten
                    </ButtonLink>
                  ) : (
                    <ButtonLink href="#kursstruktur" className="rounded-full px-6" fullWidth variant="glass">
                      Mehr erfahren
                    </ButtonLink>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div id="kursstruktur" className="space-y-5 scroll-mt-6">
            <SectionTitle
              tone="dark"
              title="Kursstruktur"
              description="Module, Lektionen, Quiz und Fortschritt sind vorbereitet. Gesperrte Lektionen werden nach Freischaltung aktiv."
            />

            <div className="space-y-4">
              {modules.map((module, index) => (
                <details
                  key={module.title}
                  open={index < 2}
                  className="group rounded-[1.5rem] border border-white/10 bg-white/[0.055] p-4 shadow-[0_18px_50px_rgba(0,0,0,0.22)]"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase text-brand-100">Modul {index + 1}</p>
                      <h2 className="mt-1 text-xl font-black text-white">{module.title}</h2>
                    </div>
                    <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-bold text-slate-400">
                      {module.lessons.length} Lektionen
                    </span>
                  </summary>
                  <div className="mt-4 space-y-2">
                    {module.lessons.map((lesson) => (
                      <LessonRow key={`${module.title}-${lesson.title}`} lesson={lesson} />
                    ))}
                  </div>
                </details>
              ))}
            </div>
          </div>

          <aside className="space-y-4">
            <Card className="rounded-[1.5rem] border-white/10 bg-white/[0.06] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.24)]">
              <h2 className="text-lg font-black text-white">Kursdaten</h2>
              <dl className="mt-5 space-y-4 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="font-semibold text-slate-500">Status</dt>
                  <dd className="text-right font-black text-white">{isEnrolled ? "Freigeschaltet" : "Noch nicht freigeschaltet"}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="font-semibold text-slate-500">Module</dt>
                  <dd className="font-black text-white">{modules.length}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="font-semibold text-slate-500">Lektionen</dt>
                  <dd className="font-black text-white">{totalLessons}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="font-semibold text-slate-500">Fortschritt</dt>
                  <dd className="font-black text-white">{progress}%</dd>
                </div>
              </dl>
            </Card>

            <Card className="rounded-[1.5rem] border-white/10 bg-white/[0.06] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.24)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase text-brand-100">Quiz</p>
                  <h2 className="mt-1 text-lg font-black text-white">Wissenscheck</h2>
                </div>
                <Badge variant={quizHref ? "brand" : "neutral"}>{quizHref ? "bereit" : "gesperrt"}</Badge>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                Kurze Multiple-Choice-Fragen prüfen die wichtigsten Punkte des Kurses.
              </p>
              {quizHref ? (
                <ButtonLink className="mt-5 rounded-full" fullWidth variant="glass" href={quizHref}>
                  Quiz starten
                </ButtonLink>
              ) : (
                <p className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-sm font-semibold text-slate-500">
                  Das Quiz wird nach Kursfreischaltung verfügbar.
                </p>
              )}
            </Card>
          </aside>
        </div>
      </section>
    </DashboardShell>
  );
}
