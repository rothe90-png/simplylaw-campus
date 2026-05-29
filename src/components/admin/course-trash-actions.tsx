"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  permanentlyDeleteAdminCourseWithState,
  restoreAdminCourseWithState,
  softDeleteAdminCourseWithState
} from "@/app/actions";
import { cn } from "@/lib/cn";

const initialState = {
  status: "idle" as const,
  message: ""
};

type TrashButtonVariant = "danger" | "outline" | "primary";

function buttonClass(variant: TrashButtonVariant) {
  return cn(
    "inline-flex min-h-10 items-center justify-center rounded-2xl px-4 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60",
    variant === "danger" &&
      "border border-red-300/25 bg-red-500/12 text-red-100 hover:-translate-y-0.5 hover:bg-red-500/20",
    variant === "outline" &&
      "border border-white/10 bg-white/[0.06] text-slate-200 hover:-translate-y-0.5 hover:bg-white/10 hover:text-white",
    variant === "primary" &&
      "border border-brand-200/20 bg-brand/22 text-brand-50 hover:-translate-y-0.5 hover:bg-brand/32"
  );
}

function CourseTrashSubmitButton({
  children,
  pendingLabel,
  variant
}: {
  children: string;
  pendingLabel: string;
  variant: TrashButtonVariant;
}) {
  const { pending } = useFormStatus();

  return (
    <button className={buttonClass(variant)} type="submit" disabled={pending} aria-disabled={pending}>
      {pending ? pendingLabel : children}
    </button>
  );
}

function ActionError({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <p className="basis-full rounded-2xl border border-red-300/20 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-100">
      {message}
    </p>
  );
}

export function SoftDeleteCourseForm({ courseId }: { courseId: string }) {
  const [state, formAction] = useActionState(softDeleteAdminCourseWithState, initialState);

  return (
    <form
      action={formAction}
      className="flex flex-wrap gap-2"
      onSubmit={(event) => {
        if (!window.confirm("Kurs wirklich in den Papierkorb verschieben?")) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="course_id" value={courseId} />
      <CourseTrashSubmitButton pendingLabel="Verschiebe..." variant="danger">
        Löschen
      </CourseTrashSubmitButton>
      {state.status === "error" ? <ActionError message={state.message} /> : null}
    </form>
  );
}

export function RestoreCourseForm({ courseId }: { courseId: string }) {
  const [state, formAction] = useActionState(restoreAdminCourseWithState, initialState);

  return (
    <form action={formAction} className="flex flex-wrap gap-2">
      <input type="hidden" name="course_id" value={courseId} />
      <CourseTrashSubmitButton pendingLabel="Stelle wieder her..." variant="primary">
        Wiederherstellen
      </CourseTrashSubmitButton>
      {state.status === "error" ? <ActionError message={state.message} /> : null}
    </form>
  );
}

export function PermanentlyDeleteCourseForm({ courseId }: { courseId: string }) {
  const [state, formAction] = useActionState(permanentlyDeleteAdminCourseWithState, initialState);

  return (
    <form
      action={formAction}
      className="flex flex-wrap gap-2"
      onSubmit={(event) => {
        if (!window.confirm("Kurs endgültig löschen? Diese Aktion kann nicht rückgängig gemacht werden.")) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="course_id" value={courseId} />
      <CourseTrashSubmitButton pendingLabel="Lösche endgültig..." variant="danger">
        Endgültig löschen
      </CourseTrashSubmitButton>
      {state.status === "error" ? <ActionError message={state.message} /> : null}
    </form>
  );
}
