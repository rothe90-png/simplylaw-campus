"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin, requireUser } from "@/lib/auth";
import { slugify } from "@/lib/format";
import { getQuizForCourse } from "@/lib/queries";
import type { Json } from "@/types/database";

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

async function ensureEnrollment(courseId: string) {
  const { supabase, user } = await requireUser();

  await supabase
    .from("course_enrollments")
    .upsert({ user_id: user.id, course_id: courseId }, { onConflict: "user_id,course_id", ignoreDuplicates: true });

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
  const { supabase } = await requireAdmin();

  await supabase.from("courses").delete().eq("id", courseId);

  revalidatePath("/admin");
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
