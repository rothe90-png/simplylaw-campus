import Link from "next/link";

export default function HomePage() {
  return (
    <section className="container-shell py-10 sm:py-16 lg:py-20">
      <div className="grid gap-10 lg:grid-cols-[1fr_440px] lg:items-center">
        <div className="max-w-3xl space-y-7">
          <div className="inline-flex rounded-md bg-brand-light px-4 py-2 text-sm font-bold text-brand">
            SimplyLaw Campus
          </div>
          <div className="space-y-5">
            <h1 className="text-4xl font-bold leading-tight text-ink sm:text-5xl">
              Rechtliches Lernen klar, strukturiert und mobil nutzbar.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-600">
              Ein schlankes Lernportal für SimplyLaw mit Kursen, Lektionen, Downloads, Quizzen und messbarem
              Lernfortschritt.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link className="btn-primary" href="/login">
              Einloggen
            </Link>
            <Link className="btn-secondary" href="/courses">
              Kurse ansehen
            </Link>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <p className="text-sm font-bold text-brand">Lernstand</p>
              <p className="text-xs font-semibold text-slate-500">MVP-Vorschau</p>
            </div>
            <span className="rounded-md bg-emerald-50 px-3 py-1 text-xs font-bold text-success">aktiv</span>
          </div>
          <div className="mt-5 space-y-4">
            {[
              ["Gutachtenstil Polizei", "67%"],
              ["Strafrecht Grundlagen", "33%"],
              ["Eingriffsrecht Grundlagen", "0%"]
            ].map(([title, progress]) => (
              <div key={title} className="rounded-md border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-bold text-ink">{title}</p>
                  <p className="text-sm font-bold text-brand">{progress}</p>
                </div>
                <div className="mt-3 h-2 rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-brand" style={{ width: progress }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
