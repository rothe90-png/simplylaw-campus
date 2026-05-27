import Link from "next/link";
import { signUpAction } from "@/app/(auth)/actions";

type PageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function RegisterPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <section className="container-shell py-10 sm:py-16">
      <div className="mx-auto max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
        <div className="space-y-2">
          <p className="text-sm font-bold uppercase text-brand">Registrierung</p>
          <h1 className="text-3xl font-bold text-ink">Konto erstellen</h1>
          <p className="text-sm leading-6 text-slate-600">Neue Nutzer starten automatisch mit der Rolle student.</p>
        </div>

        {params.error ? <p className="mt-5 rounded-md bg-red-50 p-3 text-sm font-semibold text-red-700">{params.error}</p> : null}

        <form action={signUpAction} className="mt-6 space-y-4">
          <label className="block space-y-2">
            <span className="label">Name</span>
            <input className="field" type="text" name="fullName" autoComplete="name" required />
          </label>
          <label className="block space-y-2">
            <span className="label">E-Mail</span>
            <input className="field" type="email" name="email" autoComplete="email" required />
          </label>
          <label className="block space-y-2">
            <span className="label">Passwort</span>
            <input className="field" type="password" name="password" autoComplete="new-password" minLength={8} required />
          </label>
          <button className="btn-primary w-full" type="submit">
            Registrieren
          </button>
        </form>

        <p className="mt-6 text-sm font-semibold text-slate-600">
          Schon registriert?{" "}
          <Link className="text-brand hover:underline" href="/login">
            Einloggen
          </Link>
        </p>
      </div>
    </section>
  );
}
