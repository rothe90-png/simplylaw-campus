import { updatePasswordAction } from "@/app/(auth)/actions";

type PageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function UpdatePasswordPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <section className="container-shell py-10 sm:py-16">
      <div className="mx-auto max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
        <div className="space-y-2">
          <p className="text-sm font-bold uppercase tracking-wide text-brand">Neues Passwort</p>
          <h1 className="text-3xl font-bold text-ink">Passwort setzen</h1>
          <p className="text-sm leading-6 text-slate-600">Lege ein neues Passwort für dein SimplyLaw Campus Konto fest.</p>
        </div>

        {params.error ? <p className="mt-5 rounded-md bg-red-50 p-3 text-sm font-semibold text-red-700">{params.error}</p> : null}

        <form action={updatePasswordAction} className="mt-6 space-y-4">
          <label className="block space-y-2">
            <span className="label">Neues Passwort</span>
            <input className="field" type="password" name="password" autoComplete="new-password" minLength={8} required />
          </label>
          <button className="btn-primary w-full" type="submit">
            Passwort speichern
          </button>
        </form>
      </div>
    </section>
  );
}
