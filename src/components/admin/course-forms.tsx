import {
  createAdminLesson,
  createAdminModule,
  updateAdminCourse,
  updateAdminLesson,
  updateAdminModule
} from "@/app/actions";
import {
  AdminCheckbox,
  AdminSelect,
  AdminSubmitButton,
  AdminTextArea,
  AdminTextInput
} from "@/components/admin/admin-fields";
import type { Course, CourseModule, Lesson } from "@/types/database";

const statusOptions = [
  { value: "draft", label: "Entwurf" },
  { value: "published", label: "Veröffentlicht" },
  { value: "archived", label: "Archiviert" }
] as const;

export function AdminCourseForm({ course }: { course: Course }) {
  const action = updateAdminCourse.bind(null, course.id);

  return (
    <form action={action} className="grid gap-4 md:grid-cols-2">
      <AdminTextInput label="Titel" name="title" defaultValue={course?.title} required />
      <AdminTextInput label="Slug" name="slug" defaultValue={course?.slug} placeholder="strafrecht" />
      <AdminTextInput label="Kategorie" name="category" defaultValue={course?.category} required />
      <AdminTextInput label="Reihenfolge" name="sort_order" type="number" defaultValue={course?.sort_order ?? course?.position ?? 0} />
      <AdminSelect label="Status" name="status" defaultValue={course?.status ?? (course?.is_published ? "published" : "draft")}>
        {statusOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </AdminSelect>
      <AdminSelect label="Zugriff" name="access_type" defaultValue={course?.access_type ?? "premium"}>
        <option value="free">Kostenlos</option>
        <option value="premium">Premium</option>
        <option value="single_purchase">Einzelkauf</option>
      </AdminSelect>
      <AdminTextInput label="Preis in Cent" name="price_cents" type="number" defaultValue={course?.price_cents} placeholder="9900" />
      <AdminTextInput label="Cover-URL" name="cover_image_url" defaultValue={course?.cover_image_url} />
      <AdminTextArea label="Kurzbeschreibung" name="short_description" defaultValue={course?.short_description} rows={3} className="md:col-span-2" />
      <AdminTextArea label="Beschreibung" name="description" defaultValue={course?.description} rows={5} required className="md:col-span-2" />
      <div className="md:col-span-2">
        <AdminSubmitButton>Kurs speichern</AdminSubmitButton>
      </div>
    </form>
  );
}

export function AdminModuleForm({ courseId, module }: { courseId: string; module?: CourseModule }) {
  const action = module ? updateAdminModule.bind(null, courseId, module.id) : createAdminModule.bind(null, courseId);

  return (
    <form action={action} className="grid gap-4 md:grid-cols-[1fr_140px_180px_auto] md:items-end">
      <AdminTextInput label="Modultitel" name="title" defaultValue={module?.title} required />
      <AdminTextInput label="Reihenfolge" name="sort_order" type="number" defaultValue={module?.sort_order ?? 0} />
      <AdminSelect label="Status" name="status" defaultValue={module?.status ?? "draft"}>
        {statusOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </AdminSelect>
      <AdminSubmitButton>{module ? "Speichern" : "Anlegen"}</AdminSubmitButton>
      <AdminTextArea label="Beschreibung" name="description" defaultValue={module?.description} rows={3} className="md:col-span-4" />
    </form>
  );
}

export function AdminLessonForm({
  courseId,
  modules,
  lesson
}: {
  courseId: string;
  modules: CourseModule[];
  lesson?: Lesson;
}) {
  const action = lesson ? updateAdminLesson.bind(null, courseId, lesson.id) : createAdminLesson.bind(null, courseId);

  return (
    <form action={action} className="grid gap-4 md:grid-cols-2">
      <AdminTextInput label="Titel" name="title" defaultValue={lesson?.title} required />
      <AdminTextInput label="Slug" name="slug" defaultValue={lesson?.slug} />
      <AdminSelect label="Modul" name="module_id" defaultValue={lesson?.module_id ?? "none"}>
        <option value="none">Kein Modul</option>
        {modules.map((module) => (
          <option key={module.id} value={module.id}>
            {module.title}
          </option>
        ))}
      </AdminSelect>
      <AdminSelect label="Status" name="status" defaultValue={lesson?.status ?? "draft"}>
        {statusOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </AdminSelect>
      <AdminTextInput label="Dauer in Minuten" name="estimated_minutes" type="number" defaultValue={lesson?.estimated_minutes ?? lesson?.duration_minutes ?? 10} />
      <AdminTextInput label="Reihenfolge" name="sort_order" type="number" defaultValue={lesson?.sort_order ?? lesson?.position ?? 0} />
      <AdminTextInput label="Video-URL" name="video_url" defaultValue={lesson?.video_url} className="md:col-span-2" />
      <AdminTextInput label="PDF-URL" name="pdf_url" defaultValue={lesson?.pdf_url ?? lesson?.pdf_path} className="md:col-span-2" />
      <AdminTextInput label="Bild-URL" name="image_url" defaultValue={lesson?.image_url} className="md:col-span-2" />
      <AdminTextArea label="Kurzbeschreibung" name="description" defaultValue={lesson?.description} rows={3} className="md:col-span-2" />
      <AdminTextArea label="Lektionstext" name="content_text" defaultValue={lesson?.content_text ?? lesson?.body} rows={7} className="md:col-span-2" />
      <AdminCheckbox label="Als kostenlose Vorschau markieren" name="is_preview" defaultChecked={lesson?.is_preview} className="md:col-span-2" />
      <div className="md:col-span-2">
        <AdminSubmitButton>{lesson ? "Lektion speichern" : "Lektion anlegen"}</AdminSubmitButton>
      </div>
    </form>
  );
}
