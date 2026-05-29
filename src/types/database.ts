export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type UserRole = "student" | "admin";
export type LessonStatus = "open" | "started" | "completed";
export type CourseStatus = "draft" | "published" | "archived";
export type CourseAccessType = "free" | "premium" | "single_purchase";
export type ContentStatus = "draft" | "published" | "archived";
export type MediaAssetType = "image" | "video" | "pdf";
export type EntitlementSource = "manual" | "stripe" | "paypal" | "apple" | "google";
export type EntitlementStatus = "active" | "expired" | "revoked";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          username: string | null;
          avatar_url: string | null;
          level: string | null;
          federal_state: string | null;
          agency: string | null;
          activity_area: string | null;
          onboarding_completed: boolean;
          role: UserRole;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          username?: string | null;
          avatar_url?: string | null;
          level?: string | null;
          federal_state?: string | null;
          agency?: string | null;
          activity_area?: string | null;
          onboarding_completed?: boolean;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          email?: string | null;
          full_name?: string | null;
          username?: string | null;
          avatar_url?: string | null;
          level?: string | null;
          federal_state?: string | null;
          agency?: string | null;
          activity_area?: string | null;
          onboarding_completed?: boolean;
          role?: UserRole;
          updated_at?: string;
        };
        Relationships: [];
      };
      courses: {
        Row: {
          id: string;
          title: string;
          slug: string;
          description: string;
          short_description: string | null;
          category: string;
          status: CourseStatus;
          access_type: CourseAccessType;
          price_cents: number | null;
          cover_image_url: string | null;
          sort_order: number;
          is_published: boolean;
          position: number;
          deleted_at: string | null;
          deleted_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          description: string;
          short_description?: string | null;
          category: string;
          status?: CourseStatus;
          access_type?: CourseAccessType;
          price_cents?: number | null;
          cover_image_url?: string | null;
          sort_order?: number;
          is_published?: boolean;
          position?: number;
          deleted_at?: string | null;
          deleted_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          slug?: string;
          description?: string;
          short_description?: string | null;
          category?: string;
          status?: CourseStatus;
          access_type?: CourseAccessType;
          price_cents?: number | null;
          cover_image_url?: string | null;
          sort_order?: number;
          is_published?: boolean;
          position?: number;
          deleted_at?: string | null;
          deleted_by?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      modules: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          description: string | null;
          sort_order: number;
          status: ContentStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          title: string;
          description?: string | null;
          sort_order?: number;
          status?: ContentStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          course_id?: string;
          title?: string;
          description?: string | null;
          sort_order?: number;
          status?: ContentStatus;
          updated_at?: string;
        };
        Relationships: [];
      };
      lessons: {
        Row: {
          id: string;
          course_id: string;
          module_id: string | null;
          title: string;
          slug: string;
          description: string | null;
          body: string | null;
          content_text: string | null;
          video_url: string | null;
          pdf_path: string | null;
          pdf_url: string | null;
          image_url: string | null;
          duration_minutes: number;
          estimated_minutes: number;
          is_preview: boolean;
          status: ContentStatus;
          position: number;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          module_id?: string | null;
          title: string;
          slug: string;
          description?: string | null;
          body?: string | null;
          content_text?: string | null;
          video_url?: string | null;
          pdf_path?: string | null;
          pdf_url?: string | null;
          image_url?: string | null;
          duration_minutes?: number;
          estimated_minutes?: number;
          is_preview?: boolean;
          status?: ContentStatus;
          position?: number;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          course_id?: string;
          module_id?: string | null;
          title?: string;
          slug?: string;
          description?: string | null;
          body?: string | null;
          content_text?: string | null;
          video_url?: string | null;
          pdf_path?: string | null;
          pdf_url?: string | null;
          image_url?: string | null;
          duration_minutes?: number;
          estimated_minutes?: number;
          is_preview?: boolean;
          status?: ContentStatus;
          position?: number;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
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
        Relationships: [];
      };
      quizzes: {
        Row: {
          id: string;
          course_id: string;
          module_id: string | null;
          lesson_id: string | null;
          title: string;
          description: string | null;
          status: ContentStatus;
          passing_score: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          module_id?: string | null;
          lesson_id?: string | null;
          title: string;
          description?: string | null;
          status?: ContentStatus;
          passing_score?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          module_id?: string | null;
          lesson_id?: string | null;
          description?: string | null;
          status?: ContentStatus;
          passing_score?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      questions: {
        Row: {
          id: string;
          quiz_id: string;
          prompt: string;
          question_text: string | null;
          explanation: string | null;
          position: number;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          quiz_id: string;
          prompt: string;
          question_text?: string | null;
          explanation?: string | null;
          position?: number;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          prompt?: string;
          question_text?: string | null;
          explanation?: string | null;
          position?: number;
          sort_order?: number;
        };
        Relationships: [];
      };
      answers: {
        Row: {
          id: string;
          question_id: string;
          answer_text: string;
          is_correct: boolean;
          position: number;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          question_id: string;
          answer_text: string;
          is_correct?: boolean;
          position?: number;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          answer_text?: string;
          is_correct?: boolean;
          position?: number;
          sort_order?: number;
        };
        Relationships: [];
      };
      media_assets: {
        Row: {
          id: string;
          title: string;
          type: MediaAssetType;
          url: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          type: MediaAssetType;
          url: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          title?: string;
          type?: MediaAssetType;
          url?: string;
          description?: string | null;
        };
        Relationships: [];
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
        Update: {
          user_id?: string;
          quiz_id?: string;
          score?: number;
          total_questions?: number;
          passed?: boolean;
          submitted_answers?: Json;
        };
        Relationships: [];
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
        Update: {
          user_id?: string;
          course_id?: string;
          enrolled_at?: string;
        };
        Relationships: [];
      };
      entitlements: {
        Row: {
          id: string;
          user_id: string;
          course_id: string;
          source: EntitlementSource;
          status: EntitlementStatus;
          starts_at: string;
          ends_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_id: string;
          source?: EntitlementSource;
          status?: EntitlementStatus;
          starts_at?: string;
          ends_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          course_id?: string;
          source?: EntitlementSource;
          status?: EntitlementStatus;
          starts_at?: string;
          ends_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {};
    Functions: {
      is_course_deleted: {
        Args: {
          course_identifier: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      user_role: UserRole;
      lesson_status: LessonStatus;
      course_status: CourseStatus;
      course_access_type: CourseAccessType;
      content_status: ContentStatus;
      media_asset_type: MediaAssetType;
      entitlement_source: EntitlementSource;
      entitlement_status: EntitlementStatus;
    };
    CompositeTypes: {};
  };
};

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];
export type Course = Database["public"]["Tables"]["courses"]["Row"];
export type CourseInsert = Database["public"]["Tables"]["courses"]["Insert"];
export type CourseUpdate = Database["public"]["Tables"]["courses"]["Update"];
export type CourseModule = Database["public"]["Tables"]["modules"]["Row"];
export type CourseModuleInsert = Database["public"]["Tables"]["modules"]["Insert"];
export type CourseModuleUpdate = Database["public"]["Tables"]["modules"]["Update"];
export type Lesson = Database["public"]["Tables"]["lessons"]["Row"];
export type LessonInsert = Database["public"]["Tables"]["lessons"]["Insert"];
export type LessonUpdate = Database["public"]["Tables"]["lessons"]["Update"];
export type LessonProgress = Database["public"]["Tables"]["lesson_progress"]["Row"];
export type Quiz = Database["public"]["Tables"]["quizzes"]["Row"];
export type QuizInsert = Database["public"]["Tables"]["quizzes"]["Insert"];
export type Question = Database["public"]["Tables"]["questions"]["Row"];
export type Answer = Database["public"]["Tables"]["answers"]["Row"];
export type QuizResult = Database["public"]["Tables"]["quiz_results"]["Row"];
export type CourseEnrollment = Database["public"]["Tables"]["course_enrollments"]["Row"];
export type CourseEnrollmentInsert = Database["public"]["Tables"]["course_enrollments"]["Insert"];
export type MediaAsset = Database["public"]["Tables"]["media_assets"]["Row"];
export type MediaAssetInsert = Database["public"]["Tables"]["media_assets"]["Insert"];
export type Entitlement = Database["public"]["Tables"]["entitlements"]["Row"];
export type EntitlementInsert = Database["public"]["Tables"]["entitlements"]["Insert"];
