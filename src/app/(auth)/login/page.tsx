import { signInAction } from "@/app/(auth)/actions";

type PageProps = {
  searchParams: Promise<{ message?: string; error?: string }>;
};

export default async function LoginPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <section className="flex min-h-screen items-center justify-center bg-[#060a14] px-4 py-10 text-white">
      <div className="pointer-events-none fixed inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_50%_0%,rgba(0,76,145,0.36),transparent_55%),linear-gradient(135deg,rgba(0,76,145,0.18),rgba(93,63,211,0.14)_48%,transparent_82%)]" />
      <div className="relative mx-auto w-full max-w-md rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-[0_26px_90px_rgba(0,0,0,0.42)] backdrop-blur-xl sm:p-8">
        <div className="space-y-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand text-sm font-bold text-white shadow-[0_0_34px_rgba(0,76,145,0.55)]">
            SL
          </div>
          <p className="pt-4 text-sm font-bold uppercase text-brand-100">Interner Zugang</p>
          <h1 className="text-3xl font-bold text-white">Einloggen</h1>
          <p className="text-sm leading-6 text-slate-400">Nur für bestehende SimplyLaw Campus Nutzer.</p>
        </div>

        {params.message ? <p className="mt-5 rounded-md bg-emerald-50 p-3 text-sm font-semibold text-success">{params.message}</p> : null}
        {params.error ? <p className="mt-5 rounded-md bg-red-50 p-3 text-sm font-semibold text-red-700">{params.error}</p> : null}

        <form action={signInAction} className="mt-6 space-y-4">
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-300">E-Mail</span>
            <input className="w-full rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-brand focus:ring-4 focus:ring-brand/20" type="email" name="email" autoComplete="email" required />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-300">Passwort</span>
            <input className="w-full rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-brand focus:ring-4 focus:ring-brand/20" type="password" name="password" autoComplete="current-password" required />
          </label>
          <button className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-brand px-5 py-3 text-sm font-semibold text-white shadow-[0_0_34px_rgba(0,76,145,0.36)] transition hover:bg-brand-dark focus:outline-none focus:ring-4 focus:ring-brand/20" type="submit">
            Einloggen
          </button>
        </form>
      </div>
    </section>
  );
}
