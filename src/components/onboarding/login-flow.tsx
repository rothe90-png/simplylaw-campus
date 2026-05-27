"use client";

import { useState } from "react";
import { signInAction } from "@/app/(auth)/actions";
import { cn } from "@/lib/cn";

type LoginFlowProps = {
  message?: string;
  error?: string;
};

function SimplyLawMark() {
  return (
    <div className="mx-auto flex items-center justify-center gap-4">
      <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/15 bg-[#07111f] text-2xl font-black text-white shadow-[0_0_54px_rgba(82,72,255,0.48)]">
        SL
      </div>
      <div className="text-left text-2xl font-black uppercase leading-none tracking-normal text-white">
        <span className="block">SimplyLaw</span>
        <span className="block">Campus</span>
      </div>
    </div>
  );
}

function ProviderButton({
  children,
  icon,
  onClick,
  muted
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
  muted?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex min-h-14 w-full items-center justify-center gap-3 rounded-full border px-5 text-base font-bold text-white transition hover:bg-white/[0.08] focus:outline-none focus:ring-4 focus:ring-brand/25",
        muted ? "border-white/20 text-slate-300" : "border-slate-500/80"
      )}
    >
      {icon ? <span className="text-xl">{icon}</span> : null}
      {children}
    </button>
  );
}

export function LoginFlow({ message, error }: LoginFlowProps) {
  const [mode, setMode] = useState<"start" | "email">("start");

  return (
    <main className="min-h-screen bg-[#060a14] text-white">
      <div className="pointer-events-none fixed inset-x-0 top-0 h-72 bg-[linear-gradient(180deg,rgba(64,70,190,0.72),rgba(0,76,145,0.24)_45%,transparent_100%)]" />
      <section className="relative mx-auto flex min-h-screen w-full max-w-md flex-col px-6 pb-10 pt-20 sm:max-w-lg sm:px-8">
        {mode === "email" ? (
          <button
            type="button"
            onClick={() => setMode("start")}
            aria-label="Zurück"
            className="absolute left-6 top-8 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-2xl text-white transition hover:bg-white/15 focus:outline-none focus:ring-4 focus:ring-brand/25"
          >
            ←
          </button>
        ) : null}

        <div className="mt-3">
          <SimplyLawMark />
        </div>

        {mode === "start" ? (
          <div className="flex flex-1 flex-col justify-center gap-9 py-10">
            <div className="space-y-4 text-center">
              <h1 className="text-5xl font-black leading-tight text-white">Einsatzbereit?</h1>
              <p className="text-xl leading-8 text-slate-400">Starte deinen SimplyLaw Campus.</p>
            </div>

            <div className="space-y-4">
              <ProviderButton icon={<span aria-hidden="true">A</span>} muted>
                Mit Apple fortfahren
              </ProviderButton>
              <ProviderButton icon={<span className="text-brand-300" aria-hidden="true">G</span>} muted>
                Mit Google fortfahren
              </ProviderButton>
              <ProviderButton onClick={() => setMode("email")}>Mit E-Mail fortfahren</ProviderButton>
            </div>

            <div className="space-y-3 text-center text-lg text-slate-400">
              <p>Du hast bereits einen Account?</p>
              <button
                type="button"
                onClick={() => setMode("email")}
                className="font-bold text-slate-300 underline decoration-slate-500 underline-offset-4 transition hover:text-white focus:outline-none focus:ring-4 focus:ring-brand/20"
              >
                Zum Login
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col justify-center py-10">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-[0_26px_90px_rgba(0,0,0,0.42)] backdrop-blur-xl">
              <div className="space-y-3">
                <p className="text-sm font-black uppercase text-brand-100">Interner Zugang</p>
                <h1 className="text-4xl font-black text-white">Zum Login</h1>
                <p className="text-base leading-7 text-slate-400">Melde dich mit deinem bestehenden SimplyLaw Konto an.</p>
              </div>

              {message ? <p className="mt-5 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-3 text-sm font-semibold text-emerald-200">{message}</p> : null}
              {error ? <p className="mt-5 rounded-2xl border border-red-300/20 bg-red-400/10 p-3 text-sm font-semibold text-red-200">{error}</p> : null}

              <form action={signInAction} className="mt-6 space-y-4">
                <label className="block space-y-2">
                  <span className="text-sm font-bold text-slate-300">E-Mail</span>
                  <input
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-4 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-brand focus:ring-4 focus:ring-brand/20"
                    type="email"
                    name="email"
                    autoComplete="email"
                    required
                  />
                </label>
                <label className="block space-y-2">
                  <span className="text-sm font-bold text-slate-300">Passwort</span>
                  <input
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-4 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-brand focus:ring-4 focus:ring-brand/20"
                    type="password"
                    name="password"
                    autoComplete="current-password"
                    required
                  />
                </label>
                <button
                  className="min-h-14 w-full rounded-full bg-[linear-gradient(135deg,#2f88ff,#004c91_48%,#5f33d6)] px-5 text-base font-black text-white shadow-[0_18px_50px_rgba(0,76,145,0.42)] transition hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-brand/25"
                  type="submit"
                >
                  Einloggen
                </button>
              </form>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
