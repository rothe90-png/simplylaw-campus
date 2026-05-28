import { createSupabaseServerClient } from "@/lib/supabase-server";
import { percent } from "@/lib/format";
import type { Answer, Course, CourseEnrollment, Lesson, LessonProgress, Question, Quiz, QuizResult } from "@/types/database";

export type CourseSummary = Course & {
  lessonsCount: number;
  completedLessons: number;
  progress: number;
  enrollment: CourseEnrollment | null;
};

export type LessonWithStatus = Lesson & {
  status: LessonProgress["status"];
};

export type QuizQuestion = Question & {
  answers: Answer[];
};

export type QuizWithQuestions = Quiz & {
  questions: QuizQuestion[];
};

export type CourseDetail = CourseSummary & {
  lessons: LessonWithStatus[];
  quiz: Quiz | null;
};

export type AdminCourse = Course & {
  lessons: Lesson[];
  quiz: QuizWithQuestions | null;
};

function completedByCourse(progress: LessonProgress[]) {
  const counts = new Map<string, number>();

  for (const row of progress) {
    if (row.status === "completed") {
      counts.set(row.course_id, (counts.get(row.course_id) || 0) + 1);
    }
  }

  return counts;
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function getCourseSummaries(options?: { enrolledOnly?: boolean }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const { data: coursesData, error: coursesError } = await supabase
    .from("courses")
    .select("*")
    .eq("is_published", true)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  if (coursesError) throw coursesError;
  const courses = coursesData ?? [];
  if (!courses.length) return [];

  const courseIds = courses.map((course) => course.id);

  const { data: lessonsData, error: lessonsError } = await supabase
    .from("lessons")
    .select("*")
    .in("course_id", courseIds);

  if (lessonsError) throw lessonsError;
  const lessons = lessonsData ?? [];

  const lessonsCount = new Map<string, number>();
  lessons.forEach((lesson) => lessonsCount.set(lesson.course_id, (lessonsCount.get(lesson.course_id) || 0) + 1));

  let progress: LessonProgress[] = [];
  let enrollments: CourseEnrollment[] = [];

  if (user) {
    const { data: progressRowsData, error: progressError } = await supabase
      .from("lesson_progress")
      .select("*")
      .eq("user_id", user.id)
      .in("course_id", courseIds);

    if (progressError) throw progressError;
    progress = progressRowsData ?? [];

    const { data: enrollmentRowsData, error: enrollmentError } = await supabase
      .from("course_enrollments")
      .select("*")
      .eq("user_id", user.id)
      .in("course_id", courseIds);

    if (enrollmentError) throw enrollmentError;
    enrollments = enrollmentRowsData ?? [];
  }

  const completedCounts = completedByCourse(progress);
  const enrollmentsByCourse = new Map(enrollments.map((enrollment) => [enrollment.course_id, enrollment]));

  const summaries: CourseSummary[] = courses.map((course) => {
    const total = lessonsCount.get(course.id) || 0;
    const completed = completedCounts.get(course.id) || 0;

    return {
      ...course,
      lessonsCount: total,
      completedLessons: completed,
      progress: percent(completed, total),
      enrollment: enrollmentsByCourse.get(course.id) || null
    };
  });

  if (options?.enrolledOnly) {
    return summaries.filter((course) => Boolean(course.enrollment));
  }

  return summaries;
}

export async function getCourseDetail(courseIdOrSlug: string): Promise<CourseDetail | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  let courseQuery = supabase.from("courses").select("*");
  courseQuery = isUuid(courseIdOrSlug) ? courseQuery.eq("id", courseIdOrSlug) : courseQuery.eq("slug", courseIdOrSlug);

  const { data: course, error: courseError } = await courseQuery.maybeSingle();

  if (courseError) throw courseError;
  if (!course || !course.is_published) return null;

  const { data: lessonsData, error: lessonsError } = await supabase
    .from("lessons")
    .select("*")
    .eq("course_id", course.id)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  if (lessonsError) throw lessonsError;
  const lessons = lessonsData ?? [];

  const { data: quiz } = await supabase.from("quizzes").select("*").eq("course_id", course.id).maybeSingle();

  let enrollment: CourseEnrollment | null = null;
  let progress: LessonProgress[] = [];

  if (user) {
    const { data: enrollmentRow } = await supabase
      .from("course_enrollments")
      .select("*")
      .eq("course_id", course.id)
      .eq("user_id", user.id)
      .maybeSingle();

    enrollment = enrollmentRow ?? null;

    const { data: progressRowsData, error: progressError } = await supabase
      .from("lesson_progress")
      .select("*")
      .eq("course_id", course.id)
      .eq("user_id", user.id);

    if (progressError) throw progressError;
    progress = progressRowsData ?? [];
  }

  const progressByLesson = new Map(progress.map((row) => [row.lesson_id, row.status]));
  const lessonRows = lessons.map((lesson) => ({
    ...lesson,
    status: progressByLesson.get(lesson.id) || "open"
  }));
  const completedLessons = lessonRows.filter((lesson) => lesson.status === "completed").length;

  return {
    ...course,
    lessonsCount: lessonRows.length,
    completedLessons,
    progress: percent(completedLessons, lessonRows.length),
    enrollment,
    lessons: lessonRows,
    quiz: quiz || null
  };
}

export async function getLessonPageData(courseIdOrSlug: string, lessonId: string) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  let courseQuery = supabase.from("courses").select("*");
  courseQuery = isUuid(courseIdOrSlug) ? courseQuery.eq("id", courseIdOrSlug) : courseQuery.eq("slug", courseIdOrSlug);

  const { data: course, error: courseError } = await courseQuery.maybeSingle();
  if (courseError) throw courseError;
  if (!course || !course.is_published) return null;

  const { data: lesson, error: lessonError } = await supabase
    .from("lessons")
    .select("*")
    .eq("id", lessonId)
    .eq("course_id", course.id)
    .maybeSingle();

  if (lessonError) throw lessonError;
  if (!lesson) return null;

  const { data: lessonsData, error: lessonsError } = await supabase
    .from("lessons")
    .select("*")
    .eq("course_id", course.id)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  if (lessonsError) throw lessonsError;
  const lessons = lessonsData ?? [];

  let progressStatus: LessonProgress["status"] = "open";
  let enrollment: CourseEnrollment | null = null;
  let pdfUrl: string | null = null;

  if (user) {
    const { data: enrollmentRow } = await supabase
      .from("course_enrollments")
      .select("*")
      .eq("course_id", course.id)
      .eq("user_id", user.id)
      .maybeSingle();

    enrollment = enrollmentRow ?? null;

    const { data: progress } = await supabase
      .from("lesson_progress")
      .select("*")
      .eq("lesson_id", lesson.id)
      .eq("user_id", user.id)
      .maybeSingle();

    progressStatus = progress?.status || "open";
  }

  if (lesson.pdf_path) {
    if (lesson.pdf_path.startsWith("http")) {
      pdfUrl = lesson.pdf_path;
    } else {
      const { data } = await supabase.storage.from("lesson-files").createSignedUrl(lesson.pdf_path, 60 * 15);
      pdfUrl = data?.signedUrl || null;
    }
  }

  const currentIndex = lessons.findIndex((item) => item.id === lesson.id);

  return {
    course,
    lesson: { ...lesson, status: progressStatus },
    enrollment,
    lessons,
    previousLesson: currentIndex > 0 ? lessons[currentIndex - 1] : null,
    nextLesson: currentIndex >= 0 && currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null,
    pdfUrl
  };
}

export async function getQuizForCourse(courseId: string): Promise<QuizWithQuestions | null> {
  const supabase = await createSupabaseServerClient();
  const { data: quiz, error: quizError } = await supabase.from("quizzes").select("*").eq("course_id", courseId).maybeSingle();

  if (quizError) throw quizError;
  if (!quiz) return null;

  const { data: questionsData, error: questionsError } = await supabase
    .from("questions")
    .select("*")
    .eq("quiz_id", quiz.id)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  if (questionsError) throw questionsError;
  const questions = questionsData ?? [];

  const questionIds = questions.map((question) => question.id);
  let answers: Answer[] = [];

  if (questionIds.length) {
    const { data: answerRowsData, error: answersError } = await supabase
      .from("answers")
      .select("*")
      .in("question_id", questionIds)
      .order("position", { ascending: true })
      .order("created_at", { ascending: true });

    if (answersError) throw answersError;
    answers = answerRowsData ?? [];
  }

  const answersByQuestion = new Map<string, Answer[]>();
  answers.forEach((answer) => {
    const rows = answersByQuestion.get(answer.question_id) || [];
    rows.push(answer);
    answersByQuestion.set(answer.question_id, rows);
  });

  return {
    ...quiz,
    questions: questions.map((question) => ({
      ...question,
      answers: answersByQuestion.get(question.id) || []
    }))
  };
}

export async function getLatestQuizResult(quizId: string): Promise<QuizResult | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("quiz_results")
    .select("*")
    .eq("quiz_id", quizId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data || null;
}

export async function getAdminCourses(): Promise<AdminCourse[]> {
  const supabase = await createSupabaseServerClient();

  const { data: coursesData, error: coursesError } = await supabase
    .from("courses")
    .select("*")
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });
  if (coursesError) throw coursesError;

  const courses = coursesData ?? [];
  if (!courses.length) return [];

  const courseIds = courses.map((course) => course.id);
  const { data: lessonsData, error: lessonsError } = await supabase
    .from("lessons")
    .select("*")
    .in("course_id", courseIds)
    .order("position", { ascending: true });
  if (lessonsError) throw lessonsError;
  const lessons = lessonsData ?? [];

  const { data: quizzesData, error: quizzesError } = await supabase.from("quizzes").select("*").in("course_id", courseIds);
  if (quizzesError) throw quizzesError;
  const quizzes = quizzesData ?? [];

  const quizIds = quizzes.map((quiz) => quiz.id);
  let questions: Question[] = [];
  let answers: Answer[] = [];

  if (quizIds.length) {
    const { data: questionRowsData, error: questionsError } = await supabase
      .from("questions")
      .select("*")
      .in("quiz_id", quizIds)
      .order("position", { ascending: true });

    if (questionsError) throw questionsError;
    questions = questionRowsData ?? [];

    const questionIds = questions.map((question) => question.id);

    if (questionIds.length) {
      const { data: answerRowsData, error: answersError } = await supabase
        .from("answers")
        .select("*")
        .in("question_id", questionIds)
        .order("position", { ascending: true });

      if (answersError) throw answersError;
      answers = answerRowsData ?? [];
    }
  }

  const lessonsByCourse = new Map<string, Lesson[]>();
  lessons.forEach((lesson) => {
    const rows = lessonsByCourse.get(lesson.course_id) || [];
    rows.push(lesson);
    lessonsByCourse.set(lesson.course_id, rows);
  });

  const answersByQuestion = new Map<string, Answer[]>();
  answers.forEach((answer) => {
    const rows = answersByQuestion.get(answer.question_id) || [];
    rows.push(answer);
    answersByQuestion.set(answer.question_id, rows);
  });

  const questionsByQuiz = new Map<string, QuizQuestion[]>();
  questions.forEach((question) => {
    const rows = questionsByQuiz.get(question.quiz_id) || [];
    rows.push({ ...question, answers: answersByQuestion.get(question.id) || [] });
    questionsByQuiz.set(question.quiz_id, rows);
  });

  const quizByCourse = new Map<string, QuizWithQuestions>();
  quizzes.forEach((quiz) => {
    quizByCourse.set(quiz.course_id, {
      ...quiz,
      questions: questionsByQuiz.get(quiz.id) || []
    });
  });

  return courses.map((course) => ({
    ...course,
    lessons: lessonsByCourse.get(course.id) || [],
    quiz: quizByCourse.get(course.id) || null
  }));
}
