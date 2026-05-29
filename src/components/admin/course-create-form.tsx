"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createAdminCourseWithState } from "@/app/actions";
import {
  AdminSelect,
  AdminSubmitButton,
  AdminTextArea,
  AdminTextInput
} from "@/components/admin/admin-fields";

const initialState = {
  status: "idle" as const,
  message: ""
};

function CourseCreateSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <AdminSubmitButton disabled={pending} aria-disabled={pending}>
      {pending ? "Kurs wird erstellt..." : "Kurs erstellen"}
    </AdminSubmitButton>
  );
}

export function AdminCourseCreateForm() {
  const [state, formAction] = useActionState(createAdminCourseWithState, initialState);

  return (
    <form action={formAction} className="grid gap-4 md:grid-cols-2">
      {state.status === "error" ? (
        <div className="md:col-span-2 rounded-2xl border border-red-300/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-100">
          {state.message}
        </div>
      ) : null}

      <AdminTextInput label="Titel" name="title" required />
      <AdminTextInput label="Slug" name="slug" placeholder="strafrecht-test" />
      <AdminTextInput label="Kategorie" name="category" required />
      <AdminTextInput label="Reihenfolge" name="sort_order" type="number" defaultValue={0} />
      <AdminSelect label="Status" name="status" defaultValue="draft">
        <option value="draft">Entwurf</option>
        <option value="published">Veröffentlicht</option>
        <option value="archived">Archiviert</option>
      </AdminSelect>
      <AdminSelect label="Zugriff" name="access_type" defaultValue="premium">
        <option value="free">Kostenlos</option>
        <option value="premium">Premium</option>
        <option value="single_purchase">Einzelkauf</option>
      </AdminSelect>
      <AdminTextInput label="Preis in Cent" name="price_cents" type="number" placeholder="9900" />
      <AdminTextInput label="Cover-URL" name="cover_image_url" />
      <AdminTextArea label="Kurzbeschreibung" name="short_description" rows={3} className="md:col-span-2" />
      <AdminTextArea label="Beschreibung" name="description" rows={5} required className="md:col-span-2" />
      <div className="md:col-span-2">
        <CourseCreateSubmitButton />
      </div>
    </form>
  );
}
