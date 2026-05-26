import Link from "next/link";
import { resetPasswordAction } from "@/app/(auth)/actions";

type PageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function ResetPasswordPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <section className="container-shell py-10 sm:py-16">
      <div className="mx-auto max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
        <div className="space-y-2">
          <p className="text-sm font-bold uppercase tracking-wide text-brand">Passwort</p>
          <h1 className="text-3xl font-bold text-ink">Passwort zurücksetzen</h1>
          <p className="text-sm leading-6 text-slate-600">Wir senden dir einen Link zum Setzen eines neuen Passworts.</p>
        </div>

        {params.error ? <p className="mt-5 rounded-md bg-red-50 p-3 text-sm font-semibold text-red-700">{params.error}</p> : null}

        <form action={resetPasswordAction} className="mt-6 space-y-4">
          <label className="block space-y-2">
            <span className="label">E-Mail</span>
            <input className="field" type="email" name="email" autoComplete="email" required />
          </label>
          <button className="btn-primary w-full" type="submit">
            Reset-Link senden
          </button>
        </form>

        <Link className="mt-6 inline-block text-sm font-semibold text-brand hover:underline" href="/login">
          Zurück zum Login
        </Link>
      </div>
    </section>
  );
}
