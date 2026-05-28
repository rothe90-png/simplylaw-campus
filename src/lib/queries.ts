import { createSupabaseServerClient } from "@/lib/supabase-server";
import { percent } from "@/lib/format";
import type {
  Answer,
  Course,
  CourseEnrollment,
  CourseModule,
  Entitlement,
  Lesson,
  LessonProgress,
  MediaAsset,
  Profile,
  Question,
  Quiz,
  QuizResult
} from "@/types/database";

export type CourseSummary = Course & {
  lessonsCount: number;
  completedLessons: number;
  progress: number;
  enrollment: CourseEnrollment | null;
};

export type LessonWithStatus = Omit<Lesson, "status"> & {
  publicationStatus: Lesson["status"];
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

export type AdminCourseListItem = Course & {
  modulesCount: number;
  lessonsCount: number;
  quizzesCount: number;
  entitlementsCount: number;
};

export type AdminCourseContent = {
  course: Course | null;
  modules: CourseModule[];
  lessons: Lesson[];
  quizzes: Quiz[];
};

export type AdminQuizListItem = Quiz & {
  courseTitle: string;
  questionsCount: number;
};

export type AdminUserListItem = Profile & {
  entitlementsCount: number;
};

export type AdminEntitlementListItem = Entitlement & {
  profile: Pick<Profile, "id" | "email" | "full_name" | "username" | "role"> | null;
  course: Pick<Course, "id" | "title" | "slug"> | null;
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
    publicationStatus: lesson.status,
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

export async function getAdminDashboardStats() {
  const supabase = await createSupabaseServerClient();
  const [courses, modules, lessons, media, quizzes, users, entitlements] = await Promise.all([
    supabase.from("courses").select("id", { count: "exact", head: true }),
    supabase.from("modules").select("id", { count: "exact", head: true }),
    supabase.from("lessons").select("id", { count: "exact", head: true }),
    supabase.from("media_assets").select("id", { count: "exact", head: true }),
    supabase.from("quizzes").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("entitlements").select("id", { count: "exact", head: true })
  ]);

  return {
    courses: courses.count || 0,
    modules: modules.count || 0,
    lessons: lessons.count || 0,
    media: media.count || 0,
    quizzes: quizzes.count || 0,
    users: users.count || 0,
    entitlements: entitlements.count || 0
  };
}

export async function getAdminCourseRows(): Promise<AdminCourseListItem[]> {
  const supabase = await createSupabaseServerClient();
  const { data: coursesData, error: coursesError } = await supabase
    .from("courses")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (coursesError) throw coursesError;
  const courses = coursesData ?? [];
  if (!courses.length) return [];

  const courseIds = courses.map((course) => course.id);
  const [modulesResponse, lessonsResponse, quizzesResponse, entitlementsResponse] = await Promise.all([
    supabase.from("modules").select("course_id").in("course_id", courseIds),
    supabase.from("lessons").select("course_id").in("course_id", courseIds),
    supabase.from("quizzes").select("course_id").in("course_id", courseIds),
    supabase.from("entitlements").select("course_id").in("course_id", courseIds)
  ]);

  if (modulesResponse.error) throw modulesResponse.error;
  if (lessonsResponse.error) throw lessonsResponse.error;
  if (quizzesResponse.error) throw quizzesResponse.error;
  if (entitlementsResponse.error) throw entitlementsResponse.error;

  const countByCourse = (rows: { course_id: string }[] | null) => {
    const counts = new Map<string, number>();
    (rows ?? []).forEach((row) => counts.set(row.course_id, (counts.get(row.course_id) || 0) + 1));
    return counts;
  };

  const modulesCount = countByCourse(modulesResponse.data);
  const lessonsCount = countByCourse(lessonsResponse.data);
  const quizzesCount = countByCourse(quizzesResponse.data);
  const entitlementsCount = countByCourse(entitlementsResponse.data);

  return courses.map((course) => ({
    ...course,
    modulesCount: modulesCount.get(course.id) || 0,
    lessonsCount: lessonsCount.get(course.id) || 0,
    quizzesCount: quizzesCount.get(course.id) || 0,
    entitlementsCount: entitlementsCount.get(course.id) || 0
  }));
}

export async function getAdminCourseContent(courseId: string): Promise<AdminCourseContent> {
  const supabase = await createSupabaseServerClient();
  const [courseResponse, modulesResponse, lessonsResponse, quizzesResponse] = await Promise.all([
    supabase.from("courses").select("*").eq("id", courseId).maybeSingle(),
    supabase.from("modules").select("*").eq("course_id", courseId).order("sort_order", { ascending: true }),
    supabase
      .from("lessons")
      .select("*")
      .eq("course_id", courseId)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true }),
    supabase.from("quizzes").select("*").eq("course_id", courseId).order("created_at", { ascending: false })
  ]);

  if (courseResponse.error) throw courseResponse.error;
  if (modulesResponse.error) throw modulesResponse.error;
  if (lessonsResponse.error) throw lessonsResponse.error;
  if (quizzesResponse.error) throw quizzesResponse.error;

  return {
    course: courseResponse.data ?? null,
    modules: modulesResponse.data ?? [],
    lessons: lessonsResponse.data ?? [],
    quizzes: quizzesResponse.data ?? []
  };
}

export async function getAdminMediaAssets(): Promise<MediaAsset[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("media_assets").select("*").order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getAdminQuizRows(): Promise<AdminQuizListItem[]> {
  const supabase = await createSupabaseServerClient();
  const { data: quizzesData, error: quizzesError } = await supabase
    .from("quizzes")
    .select("*")
    .order("created_at", { ascending: false });

  if (quizzesError) throw quizzesError;
  const quizzes = quizzesData ?? [];
  if (!quizzes.length) return [];

  const courseIds = [...new Set(quizzes.map((quiz) => quiz.course_id))];
  const quizIds = quizzes.map((quiz) => quiz.id);
  const [coursesResponse, questionsResponse] = await Promise.all([
    supabase.from("courses").select("id,title,slug").in("id", courseIds),
    supabase.from("questions").select("quiz_id").in("quiz_id", quizIds)
  ]);

  if (coursesResponse.error) throw coursesResponse.error;
  if (questionsResponse.error) throw questionsResponse.error;

  const coursesById = new Map((coursesResponse.data ?? []).map((course) => [course.id, course]));
  const questionCounts = new Map<string, number>();
  (questionsResponse.data ?? []).forEach((question) => {
    questionCounts.set(question.quiz_id, (questionCounts.get(question.quiz_id) || 0) + 1);
  });

  return quizzes.map((quiz) => ({
    ...quiz,
    courseTitle: coursesById.get(quiz.course_id)?.title || "Unbekannter Kurs",
    questionsCount: questionCounts.get(quiz.id) || 0
  }));
}

export async function getAdminUsers(): Promise<AdminUserListItem[]> {
  const supabase = await createSupabaseServerClient();
  const { data: profilesData, error: profilesError } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (profilesError) throw profilesError;
  const profiles = profilesData ?? [];
  if (!profiles.length) return [];

  const userIds = profiles.map((profile) => profile.id);
  const { data: entitlementRows, error: entitlementsError } = await supabase
    .from("entitlements")
    .select("user_id")
    .in("user_id", userIds);

  if (entitlementsError) throw entitlementsError;

  const entitlementCounts = new Map<string, number>();
  (entitlementRows ?? []).forEach((row) => entitlementCounts.set(row.user_id, (entitlementCounts.get(row.user_id) || 0) + 1));

  return profiles.map((profile) => ({
    ...profile,
    entitlementsCount: entitlementCounts.get(profile.id) || 0
  }));
}

export async function getAdminEntitlements(): Promise<AdminEntitlementListItem[]> {
  const supabase = await createSupabaseServerClient();
  const { data: entitlementsData, error: entitlementsError } = await supabase
    .from("entitlements")
    .select("*")
    .order("created_at", { ascending: false });

  if (entitlementsError) throw entitlementsError;
  const entitlements = entitlementsData ?? [];
  if (!entitlements.length) return [];

  const userIds = [...new Set(entitlements.map((entitlement) => entitlement.user_id))];
  const courseIds = [...new Set(entitlements.map((entitlement) => entitlement.course_id))];
  const [profilesResponse, coursesResponse] = await Promise.all([
    supabase.from("profiles").select("id,email,full_name,username,role").in("id", userIds),
    supabase.from("courses").select("id,title,slug").in("id", courseIds)
  ]);

  if (profilesResponse.error) throw profilesResponse.error;
  if (coursesResponse.error) throw coursesResponse.error;

  const profilesById = new Map((profilesResponse.data ?? []).map((profile) => [profile.id, profile]));
  const coursesById = new Map((coursesResponse.data ?? []).map((course) => [course.id, course]));

  return entitlements.map((entitlement) => ({
    ...entitlement,
    profile: profilesById.get(entitlement.user_id) || null,
    course: coursesById.get(entitlement.course_id) || null
  }));
}
