export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type UserRole = "student" | "admin";
export type LessonStatus = "open" | "started" | "completed";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          role: UserRole;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          full_name?: string | null;
          role?: UserRole;
          updated_at?: string;
        };
      };
      courses: {
        Row: {
          id: string;
          title: string;
          slug: string;
          description: string;
          category: string;
          is_published: boolean;
          position: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          description: string;
          category: string;
          is_published?: boolean;
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          slug?: string;
          description?: string;
          category?: string;
          is_published?: boolean;
          position?: number;
          updated_at?: string;
        };
      };
      lessons: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          slug: string;
          description: string | null;
          body: string | null;
          video_url: string | null;
          pdf_path: string | null;
          duration_minutes: number;
          position: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          title: string;
          slug: string;
          description?: string | null;
          body?: string | null;
          video_url?: string | null;
          pdf_path?: string | null;
          duration_minutes?: number;
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          slug?: string;
          description?: string | null;
          body?: string | null;
          video_url?: string | null;
          pdf_path?: string | null;
          duration_minutes?: number;
          position?: number;
          updated_at?: string;
        };
      };
      lesson_progress: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          lesson_id: string;
          status: LessonStatus;
          completed_at: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          lesson_id: string;
          status?: LessonStatus;
          completed_at?: string | null;
          updated_at?: string;
        };
        Update: {
          status?: LessonStatus;
          completed_at?: string | null;
          updated_at?: string;
        };
      };
      quizzes: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          passing_score: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          title: string;
          passing_score?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          passing_score?: number;
          updated_at?: string;
        };
      };
      questions: {
        Row: {
          id: string;
          quiz_id: string;
          prompt: string;
          position: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          quiz_id: string;
          prompt: string;
          position?: number;
          created_at?: string;
        };
        Update: {
          prompt?: string;
          position?: number;
        };
      };
      answers: {
        Row: {
          id: string;
          question_id: string;
          answer_text: string;
          is_correct: boolean;
          position: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          question_id: string;
          answer_text: string;
          is_correct?: boolean;
          position?: number;
          created_at?: string;
        };
        Update: {
          answer_text?: string;
          is_correct?: boolean;
          position?: number;
        };
      };
      quiz_results: {
        Row: {
          id: string;
          user_id: string;
          quiz_id: string;
          score: number;
          total_questions: number;
          passed: boolean;
          submitted_answers: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          quiz_id: string;
          score: number;
          total_questions: number;
          passed: boolean;
          submitted_answers?: Json;
          created_at?: string;
        };
        Update: never;
      };
      course_enrollments: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          enrolled_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          enrolled_at?: string;
        };
        Update: never;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      lesson_status: LessonStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Course = Database["public"]["Tables"]["courses"]["Row"];
export type Lesson = Database["public"]["Tables"]["lessons"]["Row"];
export type LessonProgress = Database["public"]["Tables"]["lesson_progress"]["Row"];
export type Quiz = Database["public"]["Tables"]["quizzes"]["Row"];
export type Question = Database["public"]["Tables"]["questions"]["Row"];
export type Answer = Database["public"]["Tables"]["answers"]["Row"];
export type QuizResult = Database["public"]["Tables"]["quiz_results"]["Row"];
export type CourseEnrollment = Database["public"]["Tables"]["course_enrollments"]["Row"];
