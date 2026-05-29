"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin, requireUser } from "@/lib/auth";
import { slugify } from "@/lib/format";
import { getQuizForCourse } from "@/lib/queries";
import type {
  ContentStatus,
  CourseAccessType,
  CourseEnrollmentInsert,
  CourseInsert,
  CourseStatus,
  CourseUpdate,
  EntitlementInsert,
  EntitlementSource,
  EntitlementStatus,
  Json,
  LessonInsert,
  LessonUpdate,
  MediaAssetInsert,
  MediaAssetType,
  QuizInsert,
  UserRole
} from "@/types/database";

function textValue(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function numberValue(formData: FormData, key: string, fallback = 0) {
  const value = Number(formData.get(key));
  return Number.isFinite(value) ? value : fallback;
}

function checkboxValue(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

function optionalTextValue(formData: FormData, key: string) {
  const value = textValue(formData, key);
  return value.length ? value : null;
}

function optionalNumberValue(formData: FormData, key: string) {
  const raw = textValue(formData, key);
  if (!raw.length) return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

function nullableIdValue(formData: FormData, key: string) {
  const value = textValue(formData, key);
  return value && value !== "none" ? value : null;
}

function selectValue<T extends string>(formData: FormData, key: string, allowed: readonly T[], fallback: T) {
  const value = textValue(formData, key) as T;
  return allowed.includes(value) ? value : fallback;
}

function dateTimeValue(formData: FormData, key: string, fallbackIso?: string) {
  const raw = textValue(formData, key);
  if (!raw.length) return fallbackIso ?? null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? fallbackIso ?? null : date.toISOString();
}

async function ensureEnrollment(courseId: string) {
  const { supabase, user } = await requireUser();
  const enrollment: CourseEnrollmentInsert = {
    user_id: user.id,
    course_id: courseId
  };

  await supabase
    .from("course_enrollments")
    .upsert(enrollment, { onConflict: "user_id,course_id", ignoreDuplicates: true });

  return { supabase, user };
}

export async function enrollInCourse(courseId: string) {
  await ensureEnrollment(courseId);
  revalidatePath("/dashboard");
  revalidatePath(`/courses/${courseId}`);
  redirect(`/courses/${courseId}`);
}

export async function markLessonStarted(courseId: string, lessonId: string) {
  const { supabase, user } = await ensureEnrollment(courseId);

  const { data: existing } = await supabase
    .from("lesson_progress")
    .select("*")
    .eq("user_id", user.id)
    .eq("lesson_id", lessonId)
    .maybeSingle();

  if (existing?.status !== "completed") {
    await supabase.from("lesson_progress").upsert(
      {
        user_id: user.id,
        course_id: courseId,
        lesson_id: lessonId,
        status: "started",
        completed_at: null
      },
      { onConflict: "user_id,lesson_id" }
    );
  }

  revalidatePath(`/courses/${courseId}`);
  revalidatePath(`/courses/${courseId}/lessons/${lessonId}`);
}

export async function completeLesson(courseId: string, lessonId: string) {
  const { supabase, user } = await ensureEnrollment(courseId);

  await supabase.from("lesson_progress").upsert(
    {
      user_id: user.id,
      course_id: courseId,
      lesson_id: lessonId,
      status: "completed",
      completed_at: new Date().toISOString()
    },
    { onConflict: "user_id,lesson_id" }
  );

  revalidatePath("/dashboard");
  revalidatePath("/courses");
  revalidatePath(`/courses/${courseId}`);
  revalidatePath(`/courses/${courseId}/lessons/${lessonId}`);
}

export async function submitQuiz(courseId: string, quizId: string, formData: FormData) {
  const { supabase, user } = await ensureEnrollment(courseId);
  const quiz = await getQuizForCourse(courseId);

  if (!quiz || quiz.id !== quizId) {
    redirect(`/courses/${courseId}`);
  }

  const submittedAnswers: Record<string, string> = {};
  let score = 0;

  for (const question of quiz.questions) {
    const selectedAnswerId = String(formData.get(question.id) || "");
    submittedAnswers[question.id] = selectedAnswerId;

    const selectedAnswer = question.answers.find((answer) => answer.id === selectedAnswerId);
    if (selectedAnswer?.is_correct) {
      score += 1;
    }
  }

  const totalQuestions = quiz.questions.length;
  const percentage = totalQuestions ? Math.round((score / totalQuestions) * 100) : 0;
  const passed = percentage >= quiz.passing_score;

  await supabase.from("quiz_results").insert({
    user_id: user.id,
    quiz_id: quiz.id,
    score,
    total_questions: totalQuestions,
    passed,
    submitted_answers: submittedAnswers as Json
  });

  revalidatePath(`/courses/${courseId}/quiz`);
  redirect(`/courses/${courseId}/quiz?score=${score}&total=${totalQuestions}&passed=${passed ? "1" : "0"}`);
}

export async function createCourse(formData: FormData) {
  const { supabase } = await requireAdmin();
  const title = textValue(formData, "title");
  const slug = slugify(textValue(formData, "slug") || title);

  await supabase.from("courses").insert({
    title,
    slug,
    description: textValue(formData, "description"),
    category: textValue(formData, "category"),
    position: numberValue(formData, "position"),
    is_published: checkboxValue(formData, "is_published")
  });

  revalidatePath("/admin");
  revalidatePath("/courses");
}

export async function updateCourse(courseId: string, formData: FormData) {
  const { supabase } = await requireAdmin();
  const title = textValue(formData, "title");
  const slug = slugify(textValue(formData, "slug") || title);

  await supabase
    .from("courses")
    .update({
      title,
      slug,
      description: textValue(formData, "description"),
      category: textValue(formData, "category"),
      position: numberValue(formData, "position"),
      is_published: checkboxValue(formData, "is_published")
    })
    .eq("id", courseId);

  revalidatePath("/admin");
  revalidatePath("/courses");
  revalidatePath(`/courses/${courseId}`);
}

export async function deleteCourse(courseId: string) {
  const { supabase, user } = await requireAdmin();

  await supabase
    .from("courses")
    .update({
      deleted_at: new Date().toISOString(),
      deleted_by: user.id
    })
    .eq("id", courseId);

  revalidatePath("/admin");
  revalidatePath("/admin/courses");
  revalidatePath("/admin/courses/trash");
  revalidatePath("/courses");
}

async function uploadLessonPdf(courseId: string, lessonId: string | null, file: File | null) {
  if (!file || file.size === 0) return null;

  const { supabase } = await requireAdmin();
  const extension = file.name.split(".").pop() || "pdf";
  const fileName = `${Date.now()}-${slugify(file.name.replace(/\.[^.]+$/, ""))}.${extension}`;
  const path = `courses/${courseId}/${lessonId || "new"}/${fileName}`;

  const { error } = await supabase.storage.from("lesson-files").upload(path, file, {
    cacheControl: "3600",
    contentType: file.type || "application/pdf",
    upsert: true
  });

  if (error) throw error;
  return path;
}

export async function createLesson(courseId: string, formData: FormData) {
  const { supabase } = await requireAdmin();
  const title = textValue(formData, "title");
  const slug = slugify(textValue(formData, "slug") || title);

  const { data: lesson, error } = await supabase
    .from("lessons")
    .insert({
      course_id: courseId,
      title,
      slug,
      description: textValue(formData, "description"),
      body: textValue(formData, "body"),
      video_url: textValue(formData, "video_url") || null,
      duration_minutes: numberValue(formData, "duration_minutes", 10),
      position: numberValue(formData, "position")
    })
    .select("*")
    .single();

  if (error) throw error;

  const pdfPath = await uploadLessonPdf(courseId, lesson.id, formData.get("pdf") as File | null);
  if (pdfPath) {
    await supabase.from("lessons").update({ pdf_path: pdfPath }).eq("id", lesson.id);
  }

  revalidatePath("/admin");
  revalidatePath(`/courses/${courseId}`);
}

export async function updateLesson(courseId: string, lessonId: string, formData: FormData) {
  const { supabase } = await requireAdmin();
  const title = textValue(formData, "title");
  const slug = slugify(textValue(formData, "slug") || title);
  const pdfPath = await uploadLessonPdf(courseId, lessonId, formData.get("pdf") as File | null);

  await supabase
    .from("lessons")
    .update({
      title,
      slug,
      description: textValue(formData, "description"),
      body: textValue(formData, "body"),
      video_url: textValue(formData, "video_url") || null,
      duration_minutes: numberValue(formData, "duration_minutes", 10),
      position: numberValue(formData, "position"),
      ...(pdfPath ? { pdf_path: pdfPath } : {})
    })
    .eq("id", lessonId);

  revalidatePath("/admin");
  revalidatePath(`/courses/${courseId}`);
  revalidatePath(`/courses/${courseId}/lessons/${lessonId}`);
}

export async function deleteLesson(courseId: string, lessonId: string) {
  const { supabase } = await requireAdmin();

  await supabase.from("lessons").delete().eq("id", lessonId);

  revalidatePath("/admin");
  revalidatePath(`/courses/${courseId}`);
}

export async function upsertQuiz(courseId: string, formData: FormData) {
  const { supabase } = await requireAdmin();
  const title = textValue(formData, "title") || "Abschlussquiz";
  const passingScore = numberValue(formData, "passing_score", 70);

  const { data: existing } = await supabase.from("quizzes").select("*").eq("course_id", courseId).maybeSingle();

  if (existing) {
    await supabase.from("quizzes").update({ title, passing_score: passingScore }).eq("id", existing.id);
  } else {
    await supabase.from("quizzes").insert({ course_id: courseId, title, passing_score: passingScore });
  }

  revalidatePath("/admin");
  revalidatePath(`/courses/${courseId}/quiz`);
}

export async function createQuestion(courseId: string, quizId: string, formData: FormData) {
  const { supabase } = await requireAdmin();
  const prompt = textValue(formData, "prompt");
  const correctIndex = numberValue(formData, "correct_answer", 0);
  const answers = [0, 1, 2, 3]
    .map((index) => ({ text: textValue(formData, `answer_${index}`), index }))
    .filter((answer) => answer.text.length > 0);

  const { data: question, error } = await supabase
    .from("questions")
    .insert({
      quiz_id: quizId,
      prompt,
      position: numberValue(formData, "position")
    })
    .select("*")
    .single();

  if (error) throw error;

  await supabase.from("answers").insert(
    answers.map((answer) => ({
      question_id: question.id,
      answer_text: answer.text,
      is_correct: answer.index === correctIndex,
      position: answer.index + 1
    }))
  );

  revalidatePath("/admin");
  revalidatePath(`/courses/${courseId}/quiz`);
}

export async function deleteQuestion(courseId: string, questionId: string) {
  const { supabase } = await requireAdmin();

  await supabase.from("questions").delete().eq("id", questionId);

  revalidatePath("/admin");
  revalidatePath(`/courses/${courseId}/quiz`);
}

const courseStatuses = ["draft", "published", "archived"] as const satisfies readonly CourseStatus[];
const courseAccessTypes = ["free", "premium", "single_purchase"] as const satisfies readonly CourseAccessType[];
const contentStatuses = ["draft", "published", "archived"] as const satisfies readonly ContentStatus[];
const mediaAssetTypes = ["image", "video", "pdf"] as const satisfies readonly MediaAssetType[];
const entitlementSources = ["manual", "stripe", "paypal", "apple", "google"] as const satisfies readonly EntitlementSource[];
const entitlementStatuses = ["active", "expired", "revoked"] as const satisfies readonly EntitlementStatus[];
const userRoles = ["student", "admin"] as const satisfies readonly UserRole[];

type AdminCourseFormPayload = Omit<CourseInsert, "id" | "created_at" | "updated_at">;
type AdminCourseCreateState = {
  status: "idle" | "error";
  message: string;
  constraint?: string;
};
type AdminCourseTrashState = {
  status: "idle" | "error";
  message: string;
};

function adminCoursePayload(formData: FormData): AdminCourseFormPayload {
  const title = textValue(formData, "title");
  const status = selectValue(formData, "status", courseStatuses, "draft");
  const sortOrder = numberValue(formData, "sort_order", 0);

  return {
    title,
    slug: slugify(textValue(formData, "slug") || title),
    description: textValue(formData, "description"),
    short_description: optionalTextValue(formData, "short_description"),
    category: textValue(formData, "category"),
    status,
    access_type: selectValue(formData, "access_type", courseAccessTypes, "premium"),
    price_cents: optionalNumberValue(formData, "price_cents"),
    cover_image_url: optionalTextValue(formData, "cover_image_url"),
    sort_order: sortOrder,
    position: sortOrder,
    is_published: status === "published"
  };
}

function postgresConstraint(error: unknown) {
  if (!error || typeof error !== "object") return null;
  const values = ["message", "details", "hint"]
    .map((key) => {
      const value = (error as Record<string, unknown>)[key];
      return typeof value === "string" ? value : "";
    })
    .join(" ");
  return values.match(/constraint "([^"]+)"/)?.[1] || null;
}

function postgresCode(error: unknown) {
  if (!error || typeof error !== "object") return null;
  const code = (error as Record<string, unknown>).code;
  return typeof code === "string" ? code : null;
}

export async function createAdminCourseWithState(
  _prevState: AdminCourseCreateState,
  formData: FormData
): Promise<AdminCourseCreateState> {
  const { supabase } = await requireAdmin();
  const payload = adminCoursePayload(formData);
  const { error } = await supabase.from("courses").insert(payload);

  if (error) {
    const constraint = postgresConstraint(error) || "courses_slug_key";

    if (postgresCode(error) === "23505") {
      if (process.env.NODE_ENV === "development") {
        console.info("[admin courses] duplicate course insert blocked", { constraint });
      }

      return {
        status: "error",
        message: "Dieser Kurs existiert bereits oder der Slug ist vergeben.",
        constraint
      };
    }

    if (process.env.NODE_ENV === "development") {
      console.info("[admin courses] course insert failed", {
        code: postgresCode(error),
        constraint
      });
    }

    return {
      status: "error",
      message: "Der Kurs konnte nicht gespeichert werden. Bitte prüfe die Angaben.",
      constraint
    };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/courses");
  revalidatePath("/courses");
  redirect("/admin/courses");
}

function adminCourseActionError(message = "Die Aktion konnte nicht ausgeführt werden. Bitte versuche es erneut."): AdminCourseTrashState {
  return {
    status: "error",
    message
  };
}

export async function softDeleteAdminCourseWithState(
  _prevState: AdminCourseTrashState,
  formData: FormData
): Promise<AdminCourseTrashState> {
  const { supabase, user } = await requireAdmin();
  const courseId = textValue(formData, "course_id");

  if (!courseId) return adminCourseActionError();

  const { error } = await supabase
    .from("courses")
    .update({
      deleted_at: new Date().toISOString(),
      deleted_by: user.id
    })
    .eq("id", courseId)
    .is("deleted_at", null);

  if (error) {
    if (process.env.NODE_ENV === "development") {
      console.info("[admin courses] soft delete failed", { code: postgresCode(error) });
    }

    return adminCourseActionError("Der Kurs konnte nicht in den Papierkorb verschoben werden.");
  }

  revalidatePath("/admin");
  revalidatePath("/admin/courses");
  revalidatePath("/admin/courses/trash");
  revalidatePath("/dashboard");
  revalidatePath("/courses");
  redirect("/admin/courses");
}

export async function restoreAdminCourseWithState(
  _prevState: AdminCourseTrashState,
  formData: FormData
): Promise<AdminCourseTrashState> {
  const { supabase } = await requireAdmin();
  const courseId = textValue(formData, "course_id");

  if (!courseId) return adminCourseActionError();

  const { error } = await supabase
    .from("courses")
    .update({
      deleted_at: null,
      deleted_by: null
    })
    .eq("id", courseId);

  if (error) {
    if (process.env.NODE_ENV === "development") {
      console.info("[admin courses] restore failed", { code: postgresCode(error) });
    }

    return adminCourseActionError("Der Kurs konnte nicht wiederhergestellt werden.");
  }

  revalidatePath("/admin");
  revalidatePath("/admin/courses");
  revalidatePath("/admin/courses/trash");
  revalidatePath("/dashboard");
  revalidatePath("/courses");
  redirect("/admin/courses/trash");
}

async function courseHasLinkedContent(
  supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"],
  courseId: string
) {
  const checks = await Promise.all([
    supabase.from("modules").select("id", { count: "exact", head: true }).eq("course_id", courseId),
    supabase.from("lessons").select("id", { count: "exact", head: true }).eq("course_id", courseId),
    supabase.from("quizzes").select("id", { count: "exact", head: true }).eq("course_id", courseId),
    supabase.from("course_enrollments").select("id", { count: "exact", head: true }).eq("course_id", courseId),
    supabase.from("entitlements").select("id", { count: "exact", head: true }).eq("course_id", courseId)
  ]);

  const failedCheck = checks.find((check) => check.error);
  if (failedCheck?.error) throw failedCheck.error;

  return checks.some((check) => (check.count || 0) > 0);
}

export async function permanentlyDeleteAdminCourseWithState(
  _prevState: AdminCourseTrashState,
  formData: FormData
): Promise<AdminCourseTrashState> {
  const { supabase } = await requireAdmin();
  const courseId = textValue(formData, "course_id");

  if (!courseId) return adminCourseActionError();

  try {
    if (await courseHasLinkedContent(supabase, courseId)) {
      return adminCourseActionError(
        "Dieser Kurs hat noch verknüpfte Inhalte. Bitte zuerst Module/Lektionen entfernen oder Archivierung nutzen."
      );
    }
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.info("[admin courses] linked content check failed", { code: postgresCode(error) });
    }

    return adminCourseActionError();
  }

  const { error } = await supabase.from("courses").delete().eq("id", courseId).not("deleted_at", "is", null);

  if (error) {
    if (postgresCode(error) === "23503") {
      return adminCourseActionError(
        "Dieser Kurs hat noch verknüpfte Inhalte. Bitte zuerst Module/Lektionen entfernen oder Archivierung nutzen."
      );
    }

    if (process.env.NODE_ENV === "development") {
      console.info("[admin courses] permanent delete failed", { code: postgresCode(error) });
    }

    return adminCourseActionError("Der Kurs konnte nicht endgültig gelöscht werden.");
  }

  revalidatePath("/admin");
  revalidatePath("/admin/courses");
  revalidatePath("/admin/courses/trash");
  revalidatePath("/dashboard");
  revalidatePath("/courses");
  redirect("/admin/courses/trash");
}

export async function updateAdminCourse(courseId: string, formData: FormData) {
  const { supabase } = await requireAdmin();
  const payload: CourseUpdate = adminCoursePayload(formData);
  const { error } = await supabase.from("courses").update(payload).eq("id", courseId);

  if (error) throw error;

  revalidatePath("/admin");
  revalidatePath("/admin/courses");
  revalidatePath(`/admin/courses/${courseId}/edit`);
  revalidatePath("/courses");
  revalidatePath(`/courses/${courseId}`);
}

export async function createAdminModule(courseId: string, formData: FormData) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("modules").insert({
    course_id: courseId,
    title: textValue(formData, "title"),
    description: optionalTextValue(formData, "description"),
    sort_order: numberValue(formData, "sort_order", 0),
    status: selectValue(formData, "status", contentStatuses, "draft")
  });

  if (error) throw error;
  revalidatePath(`/admin/courses/${courseId}/modules`);
  revalidatePath(`/courses/${courseId}`);
}

export async function updateAdminModule(courseId: string, moduleId: string, formData: FormData) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase
    .from("modules")
    .update({
      title: textValue(formData, "title"),
      description: optionalTextValue(formData, "description"),
      sort_order: numberValue(formData, "sort_order", 0),
      status: selectValue(formData, "status", contentStatuses, "draft")
    })
    .eq("id", moduleId);

  if (error) throw error;
  revalidatePath(`/admin/courses/${courseId}/modules`);
  revalidatePath(`/courses/${courseId}`);
}

type AdminLessonFormPayload = Omit<LessonInsert, "id" | "created_at" | "updated_at">;

function adminLessonPayload(courseId: string, formData: FormData): AdminLessonFormPayload {
  const title = textValue(formData, "title");
  const sortOrder = numberValue(formData, "sort_order", 0);
  const minutes = numberValue(formData, "estimated_minutes", 10);
  const content = textValue(formData, "content_text");

  return {
    course_id: courseId,
    module_id: nullableIdValue(formData, "module_id"),
    title,
    slug: slugify(textValue(formData, "slug") || title),
    description: optionalTextValue(formData, "description"),
    body: content,
    content_text: content,
    video_url: optionalTextValue(formData, "video_url"),
    pdf_url: optionalTextValue(formData, "pdf_url"),
    image_url: optionalTextValue(formData, "image_url"),
    duration_minutes: minutes,
    estimated_minutes: minutes,
    is_preview: checkboxValue(formData, "is_preview"),
    status: selectValue(formData, "status", contentStatuses, "draft"),
    position: sortOrder,
    sort_order: sortOrder
  };
}

export async function createAdminLesson(courseId: string, formData: FormData) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("lessons").insert(adminLessonPayload(courseId, formData));

  if (error) throw error;
  revalidatePath(`/admin/courses/${courseId}/lessons`);
  revalidatePath(`/courses/${courseId}`);
}

export async function updateAdminLesson(courseId: string, lessonId: string, formData: FormData) {
  const { supabase } = await requireAdmin();
  const payload: LessonUpdate = adminLessonPayload(courseId, formData);
  const { error } = await supabase.from("lessons").update(payload).eq("id", lessonId);

  if (error) throw error;
  revalidatePath(`/admin/courses/${courseId}/lessons`);
  revalidatePath(`/courses/${courseId}`);
  revalidatePath(`/courses/${courseId}/lessons/${lessonId}`);
}

export async function createAdminMediaAsset(formData: FormData) {
  const { supabase } = await requireAdmin();
  const payload: MediaAssetInsert = {
    title: textValue(formData, "title"),
    type: selectValue(formData, "type", mediaAssetTypes, "image"),
    url: textValue(formData, "url"),
    description: optionalTextValue(formData, "description")
  };
  const { error } = await supabase.from("media_assets").insert(payload);

  if (error) throw error;
  revalidatePath("/admin/media");
}

export async function createAdminQuiz(formData: FormData) {
  const { supabase } = await requireAdmin();
  const courseId = textValue(formData, "course_id");
  const payload: QuizInsert = {
    course_id: courseId,
    module_id: nullableIdValue(formData, "module_id"),
    lesson_id: nullableIdValue(formData, "lesson_id"),
    title: textValue(formData, "title"),
    description: optionalTextValue(formData, "description"),
    status: selectValue(formData, "status", contentStatuses, "draft"),
    passing_score: numberValue(formData, "passing_score", 70)
  };
  const { error } = await supabase.from("quizzes").insert(payload);

  if (error) throw error;
  revalidatePath("/admin/quizzes");
  revalidatePath(`/admin/courses/${courseId}/edit`);
  revalidatePath(`/courses/${courseId}/quiz`);
}

export async function updateAdminUserRole(userId: string, formData: FormData) {
  const { supabase, user } = await requireAdmin();
  const role = selectValue(formData, "role", userRoles, "student");

  if (user.id === userId && role !== "admin") {
    throw new Error("Du kannst deine eigene Adminrolle nicht entfernen.");
  }

  const { error } = await supabase.from("profiles").update({ role }).eq("id", userId);

  if (error) throw error;
  revalidatePath("/admin/users");
}

export async function createAdminEntitlement(formData: FormData) {
  const { supabase } = await requireAdmin();
  const userId = textValue(formData, "user_id");
  const courseId = textValue(formData, "course_id");
  const status = selectValue(formData, "status", entitlementStatuses, "active");
  const payload: EntitlementInsert = {
    user_id: userId,
    course_id: courseId,
    source: selectValue(formData, "source", entitlementSources, "manual"),
    status,
    starts_at: dateTimeValue(formData, "starts_at", new Date().toISOString()) || new Date().toISOString(),
    ends_at: dateTimeValue(formData, "ends_at")
  };

  const { error } = await supabase.from("entitlements").insert(payload);
  if (error) throw error;

  if (status === "active") {
    const enrollment: CourseEnrollmentInsert = { user_id: userId, course_id: courseId };
    await supabase.from("course_enrollments").upsert(enrollment, { onConflict: "user_id,course_id", ignoreDuplicates: true });
  }

  revalidatePath("/admin/entitlements");
  revalidatePath("/admin/courses");
  revalidatePath("/dashboard");
}

export async function updateAdminEntitlementStatus(entitlementId: string, formData: FormData) {
  const { supabase } = await requireAdmin();
  const status = selectValue(formData, "status", entitlementStatuses, "active");
  const { data, error } = await supabase.from("entitlements").update({ status }).eq("id", entitlementId).select("*").single();

  if (error) throw error;

  if (status === "active" && data) {
    const enrollment: CourseEnrollmentInsert = { user_id: data.user_id, course_id: data.course_id };
    await supabase.from("course_enrollments").upsert(enrollment, { onConflict: "user_id,course_id", ignoreDuplicates: true });
  }

  revalidatePath("/admin/entitlements");
  revalidatePath("/dashboard");
}
