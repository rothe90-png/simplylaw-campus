"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/cn";

type Step = "username" | "photo" | "level" | "state" | "agency" | "activity" | "premium";

type OnboardingValues = {
  username: string;
  avatarUrl: string;
  level: string;
  federalState: string;
  agency: string;
  activityArea: string;
};

type OnboardingFlowProps = {
  action: (formData: FormData) => void | Promise<void>;
  error?: string;
  initialValues: OnboardingValues;
};

type Choice = {
  value: string;
  title: string;
  subtitle?: string;
  image: string;
};

const levels: Choice[] = [
  {
    value: "Bundesebene",
    title: "Bundesebene",
    subtitle: "Bundespolizei",
    image:
      "linear-gradient(90deg,rgba(10,18,32,0.92),rgba(10,18,32,0.58)),radial-gradient(circle at 78% 34%,rgba(244,196,92,0.45),transparent 22%),linear-gradient(135deg,#18263b,#28364d)"
  },
  {
    value: "Landesebene",
    title: "Landesebene",
    subtitle: "Landespolizei",
    image:
      "linear-gradient(90deg,rgba(10,18,32,0.92),rgba(10,18,32,0.42)),radial-gradient(circle at 78% 42%,rgba(47,136,255,0.56),transparent 24%),linear-gradient(135deg,#111b2b,#1d4f7c)"
  },
  {
    value: "Kommunale Ebene",
    title: "Kommunale Ebene",
    subtitle: "Kommunalbehörde",
    image:
      "linear-gradient(90deg,rgba(10,18,32,0.92),rgba(10,18,32,0.46)),radial-gradient(circle at 78% 50%,rgba(240,92,92,0.36),transparent 26%),linear-gradient(135deg,#152033,#304155)"
  },
  {
    value: "Sicherheitsdienst",
    title: "Sicherheitsdienst",
    image:
      "linear-gradient(90deg,rgba(10,18,32,0.92),rgba(10,18,32,0.45)),radial-gradient(circle at 80% 48%,rgba(255,132,36,0.42),transparent 26%),linear-gradient(135deg,#172033,#3a2c25)"
  }
];

const federalStates = [
  "Baden-Württemberg",
  "Bayern",
  "Berlin",
  "Brandenburg",
  "Bremen",
  "Hamburg",
  "Hessen",
  "Mecklenburg-Vorpommern",
  "Niedersachsen",
  "Nordrhein-Westfalen",
  "Rheinland-Pfalz",
  "Saarland",
  "Sachsen",
  "Sachsen-Anhalt",
  "Schleswig-Holstein",
  "Thüringen"
];

const agencies: Choice[] = [
  {
    value: "Landespolizei",
    title: "Landespolizei",
    image:
      "linear-gradient(90deg,rgba(10,18,32,0.93),rgba(10,18,32,0.36)),radial-gradient(circle at 82% 50%,rgba(48,132,255,0.68),transparent 23%),linear-gradient(135deg,#101a2c,#244d79)"
  },
  {
    value: "LKA",
    title: "Landeskriminalamt (LKA)",
    image:
      "linear-gradient(90deg,rgba(10,18,32,0.93),rgba(10,18,32,0.42)),radial-gradient(circle at 78% 48%,rgba(49,211,201,0.38),transparent 28%),linear-gradient(135deg,#101a2c,#123a45)"
  },
  {
    value: "Verfassungsschutz",
    title: "Verfassungsschutz",
    image:
      "linear-gradient(90deg,rgba(10,18,32,0.93),rgba(10,18,32,0.48)),radial-gradient(circle at 82% 48%,rgba(149,163,178,0.42),transparent 30%),linear-gradient(135deg,#101a2c,#3a4352)"
  },
  {
    value: "JVA",
    title: "JVA",
    image:
      "linear-gradient(90deg,rgba(10,18,32,0.93),rgba(10,18,32,0.44)),radial-gradient(circle at 82% 50%,rgba(255,255,255,0.22),transparent 28%),linear-gradient(135deg,#101a2c,#2f3b4f)"
  },
  {
    value: "Sicherheitsdienst",
    title: "Sicherheitsdienst",
    image:
      "linear-gradient(90deg,rgba(10,18,32,0.93),rgba(10,18,32,0.46)),radial-gradient(circle at 80% 48%,rgba(255,132,36,0.38),transparent 26%),linear-gradient(135deg,#101a2c,#3a2c25)"
  }
];

const activityAreas: Choice[] = [
  {
    value: "Polizeipräsidium",
    title: "Polizeipräsidium",
    image:
      "linear-gradient(90deg,rgba(10,18,32,0.93),rgba(10,18,32,0.38)),radial-gradient(circle at 82% 48%,rgba(47,136,255,0.6),transparent 26%),linear-gradient(135deg,#101a2c,#244d79)"
  },
  {
    value: "Einheit",
    title: "Einheit",
    image:
      "linear-gradient(90deg,rgba(10,18,32,0.93),rgba(10,18,32,0.4)),radial-gradient(circle at 82% 45%,rgba(95,51,214,0.52),transparent 26%),linear-gradient(135deg,#101a2c,#2a244f)"
  }
];

function AppLogo() {
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

function BackButton({ onClick, visible }: { onClick: () => void; visible: boolean }) {
  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Zurück"
      className="absolute left-5 top-7 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-2xl text-white transition hover:bg-white/15 focus:outline-none focus:ring-4 focus:ring-brand/25"
    >
      ←
    </button>
  );
}

function GradientButton({
  children,
  disabled,
  onClick,
  type = "button"
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="min-h-14 w-full rounded-full bg-[linear-gradient(135deg,#2f88ff,#004c91_48%,#5f33d6)] px-5 text-base font-black text-white shadow-[0_18px_50px_rgba(0,76,145,0.42)] transition hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-brand/25 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:brightness-100"
    >
      {children}
    </button>
  );
}

function StepHeadline({ title, subtitle, centered = false }: { title: string; subtitle: string; centered?: boolean }) {
  return (
    <div className={cn("space-y-4", centered && "text-center")}>
      <h1 className="text-4xl font-black leading-tight text-white sm:text-5xl">{title}</h1>
      <p className="text-xl leading-8 text-slate-400">{subtitle}</p>
    </div>
  );
}

function OptionCard({
  choice,
  selected,
  onSelect
}: {
  choice: Choice;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "relative min-h-28 w-full overflow-hidden rounded-3xl border p-5 text-left shadow-[0_18px_46px_rgba(0,0,0,0.28)] transition focus:outline-none focus:ring-4 focus:ring-brand/25",
        selected ? "border-brand-300 shadow-[0_0_34px_rgba(47,136,255,0.28)]" : "border-black/40 hover:border-white/30"
      )}
      style={{ backgroundImage: choice.image }}
    >
      <div className="relative z-10 flex items-center gap-4">
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2",
            selected ? "border-brand-300 bg-brand shadow-[0_0_20px_rgba(47,136,255,0.48)]" : "border-slate-500 bg-slate-900/35"
          )}
        >
          {selected ? <span className="h-3 w-3 rounded-full bg-white" /> : null}
        </span>
        <span>
          <span className="block text-xl font-black leading-7 text-white">{choice.title}</span>
          {choice.subtitle ? <span className="mt-1 block text-lg font-bold text-white">{choice.subtitle}</span> : null}
        </span>
      </div>
    </button>
  );
}

function FieldShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-14 items-center gap-3 rounded-2xl border border-slate-600/60 bg-slate-800/80 px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
      {children}
    </div>
  );
}

function SceneTop({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-x-0 top-0 -z-0 bg-[linear-gradient(180deg,rgba(0,76,145,0.52),rgba(6,10,20,0.72)_62%,#060a14_100%),radial-gradient(circle_at_58%_5%,rgba(255,255,255,0.22),transparent_16%),radial-gradient(circle_at_72%_12%,rgba(47,136,255,0.36),transparent_18%)]",
        compact ? "h-64" : "h-80"
      )}
    />
  );
}

function StatePicker({
  value,
  onChange
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-4">
        <div className="mx-auto flex max-w-xs flex-col gap-2 rounded-[1.5rem] border border-slate-500/50 bg-slate-800/80 p-4 text-slate-300">
          <div className="grid grid-cols-3 gap-2">
            {["SH", "MV", "NI", "BE", "NW", "HE", "SN", "BY", "BW"].map((token) => (
              <div key={token} className="rounded-xl border border-white/10 bg-slate-700/60 px-2 py-4 text-center text-xs font-black">
                {token}
              </div>
            ))}
          </div>
          <p className="pt-2 text-center text-xs font-semibold text-slate-500">Interaktive Karte folgt</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* TODO: Replace this grid with an interactive Germany SVG map once final map assets are available. */}
        {federalStates.map((state) => (
          <button
            key={state}
            type="button"
            onClick={() => onChange(state)}
            className={cn(
              "rounded-2xl border px-4 py-3 text-left text-sm font-bold transition focus:outline-none focus:ring-4 focus:ring-brand/25",
              value === state
                ? "border-brand-300 bg-brand/35 text-white shadow-[0_0_24px_rgba(47,136,255,0.28)]"
                : "border-white/10 bg-white/[0.06] text-slate-300 hover:bg-white/[0.09]"
            )}
          >
            {state}
          </button>
        ))}
      </div>
    </div>
  );
}

function PremiumVisual() {
  return (
    <div className="relative -mx-6 -mt-10 h-64 overflow-hidden sm:-mx-8">
      <div className="grid h-56 grid-cols-3 gap-1 opacity-90">
        {Array.from({ length: 9 }).map((_, index) => (
          <div
            key={index}
            className="bg-[linear-gradient(135deg,rgba(47,136,255,0.34),rgba(95,51,214,0.18)),radial-gradient(circle_at_50%_35%,rgba(255,255,255,0.22),transparent_22%)]"
          />
        ))}
      </div>
      <div className="absolute inset-x-0 bottom-0 h-36 bg-[linear-gradient(180deg,transparent,#060a14_72%)]" />
    </div>
  );
}

export function OnboardingFlow({ action, error, initialValues }: OnboardingFlowProps) {
  const [step, setStep] = useState<Step>("username");
  const [username, setUsername] = useState(initialValues.username.slice(0, 14));
  const [avatarPreview, setAvatarPreview] = useState(initialValues.avatarUrl);
  const [level, setLevel] = useState(initialValues.level);
  const [federalState, setFederalState] = useState(initialValues.federalState);
  const [agency, setAgency] = useState(initialValues.agency);
  const [activityArea, setActivityArea] = useState(initialValues.activityArea);

  useEffect(() => {
    return () => {
      if (avatarPreview.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const canContinue = useMemo(() => {
    if (step === "username") return username.trim().length > 0;
    if (step === "level") return Boolean(level);
    if (step === "state") return Boolean(federalState);
    if (step === "agency") return Boolean(agency);
    if (step === "activity") return Boolean(activityArea);
    return true;
  }, [activityArea, agency, federalState, level, step, username]);

  function nextStep() {
    setStep((current) => {
      if (current === "username") return "photo";
      if (current === "photo") return "level";
      if (current === "level") return level === "Bundesebene" ? "agency" : "state";
      if (current === "state") return "agency";
      if (current === "agency") return "activity";
      if (current === "activity") return "premium";
      return current;
    });
  }

  function previousStep() {
    setStep((current) => {
      if (current === "photo") return "username";
      if (current === "level") return "photo";
      if (current === "state") return "level";
      if (current === "agency") return level === "Bundesebene" ? "level" : "state";
      if (current === "activity") return "agency";
      if (current === "premium") return "activity";
      return current;
    });
  }

  function handleAvatarChange(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;

    if (avatarPreview.startsWith("blob:")) {
      URL.revokeObjectURL(avatarPreview);
    }

    // TODO: Upload this file to a Supabase avatar bucket and persist the public URL.
    setAvatarPreview(URL.createObjectURL(file));
  }

  const showLogo = step === "username" || step === "photo";
  const showScene = step === "level" || step === "state" || step === "agency" || step === "activity";

  return (
    <main className="min-h-screen bg-[#060a14] text-white">
      <form action={action} className="relative mx-auto min-h-screen w-full max-w-md overflow-hidden px-6 pb-8 pt-20 sm:max-w-lg sm:px-8">
        <input type="hidden" name="username" value={username.trim()} readOnly />
        <input type="hidden" name="avatar_url" value={initialValues.avatarUrl} readOnly />
        <input type="hidden" name="level" value={level} readOnly />
        <input type="hidden" name="federal_state" value={federalState} readOnly />
        <input type="hidden" name="agency" value={agency} readOnly />
        <input type="hidden" name="activity_area" value={activityArea} readOnly />

        <BackButton onClick={previousStep} visible={step !== "username"} />
        {showScene ? <SceneTop compact={step === "activity"} /> : <div className="pointer-events-none fixed inset-x-0 top-0 h-72 bg-[linear-gradient(180deg,rgba(64,70,190,0.72),rgba(0,76,145,0.24)_45%,transparent_100%)]" />}

        {error ? <p className="relative z-10 mb-5 rounded-2xl border border-red-300/20 bg-red-400/10 p-3 text-sm font-semibold text-red-200">{error}</p> : null}

        {showLogo ? (
          <div className="relative z-10 mb-10">
            <AppLogo />
          </div>
        ) : null}

        {step === "username" ? (
          <section className="relative z-10 flex min-h-[calc(100vh-9rem)] flex-col justify-between gap-10 pb-3">
            <div className="space-y-10">
              <StepHeadline
                centered
                title="Wie möchtest du genannt werden?"
                subtitle="Du kannst deinen Nutzernamen später jederzeit ändern."
              />
              <FieldShell>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-500 text-sm font-black text-slate-950">SL</span>
                <input
                  value={username}
                  onChange={(event) => setUsername(event.target.value.slice(0, 14))}
                  name="username_visible"
                  maxLength={14}
                  placeholder="Dein Nutzername"
                  className="min-w-0 flex-1 bg-transparent text-lg font-bold text-white outline-none placeholder:text-slate-400"
                />
                <span className="shrink-0 text-base font-bold text-slate-400">{username.length}/14</span>
              </FieldShell>
            </div>
            <GradientButton disabled={!canContinue} onClick={nextStep}>
              Weiter
            </GradientButton>
          </section>
        ) : null}

        {step === "photo" ? (
          <section className="relative z-10 flex min-h-[calc(100vh-9rem)] flex-col justify-between gap-10 pb-3">
            <div className="space-y-10 text-center">
              <StepHeadline centered title="So sieht's aus!" subtitle="Ohne Profilbild macht das Lernen doch nur halb so viel Spaß." />
              <div className="mx-auto space-y-5">
                <label className="group relative mx-auto block h-40 w-40 cursor-pointer rounded-full bg-slate-400 shadow-[0_0_54px_rgba(148,163,184,0.22)]">
                  {avatarPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarPreview} alt="" className="h-full w-full rounded-full object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-5xl font-black text-slate-800">SL</span>
                  )}
                  <span className="absolute bottom-2 right-0 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-slate-800 text-xl shadow-lg transition group-hover:bg-slate-700">
                    ◯
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="user"
                    className="sr-only"
                    onChange={(event) => handleAvatarChange(event.currentTarget.files)}
                  />
                </label>
                <label className="mx-auto inline-flex cursor-pointer items-center justify-center rounded-full border border-white/15 px-5 py-3 text-sm font-black text-white transition hover:bg-white/[0.08]">
                  Profilbild hochladen
                  <input
                    type="file"
                    accept="image/*"
                    capture="user"
                    className="sr-only"
                    onChange={(event) => handleAvatarChange(event.currentTarget.files)}
                  />
                </label>
              </div>
            </div>
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => {
                  setAvatarPreview("");
                  nextStep();
                }}
                className="min-h-14 w-full rounded-full border border-white/80 px-5 text-base font-black text-white transition hover:bg-white/[0.08] focus:outline-none focus:ring-4 focus:ring-brand/25"
              >
                Profilbild überspringen
              </button>
              <GradientButton onClick={nextStep}>Profilbild speichern</GradientButton>
            </div>
          </section>
        ) : null}

        {step === "level" ? (
          <section className="relative z-10 flex min-h-[calc(100vh-7rem)] flex-col justify-between gap-8 pb-3 pt-20">
            <div className="space-y-8">
              <StepHeadline title="Wähle deine Ebene" subtitle="Damit wir deine Lerninhalte besser auf dich abstimmen können." />
              <div className="space-y-4">
                {levels.map((choice) => (
                  <OptionCard
                    key={choice.value}
                    choice={choice}
                    selected={level === choice.value}
                    onSelect={() => {
                      setLevel(choice.value);
                      if (choice.value === "Bundesebene") setFederalState("");
                    }}
                  />
                ))}
              </div>
            </div>
            <GradientButton disabled={!canContinue} onClick={nextStep}>
              Weiter
            </GradientButton>
          </section>
        ) : null}

        {step === "state" ? (
          <section className="relative z-10 flex min-h-[calc(100vh-7rem)] flex-col justify-between gap-8 pb-3 pt-20">
            <div className="space-y-8">
              <StepHeadline title="Bundesland wählen" subtitle="In welchem Bundesland liegt deine Dienststelle?" />
              <StatePicker value={federalState} onChange={setFederalState} />
            </div>
            <GradientButton disabled={!canContinue} onClick={nextStep}>
              Weiter
            </GradientButton>
          </section>
        ) : null}

        {step === "agency" ? (
          <section className="relative z-10 flex min-h-[calc(100vh-7rem)] flex-col justify-between gap-8 pb-3 pt-20">
            <div className="space-y-8">
              <StepHeadline title="Wähle deine Behörde" subtitle="Lerne mit praxisnahen Fragen für deine Organisation." />
              <div className="space-y-4">
                {agencies.map((choice) => (
                  <OptionCard key={choice.value} choice={choice} selected={agency === choice.value} onSelect={() => setAgency(choice.value)} />
                ))}
              </div>
            </div>
            <GradientButton disabled={!canContinue} onClick={nextStep}>
              Weiter
            </GradientButton>
          </section>
        ) : null}

        {step === "activity" ? (
          <section className="relative z-10 flex min-h-[calc(100vh-7rem)] flex-col justify-between gap-8 pb-3 pt-20">
            <div className="space-y-8">
              <StepHeadline title="Tätigkeitsbereich wählen" subtitle="Damit deine Lernstrecke zu deinem Alltag passt." />
              <div className="space-y-4">
                {activityAreas.map((choice) => (
                  <OptionCard
                    key={choice.value}
                    choice={choice}
                    selected={activityArea === choice.value}
                    onSelect={() => setActivityArea(choice.value)}
                  />
                ))}
              </div>
            </div>
            <GradientButton disabled={!canContinue} onClick={nextStep}>
              Weiter
            </GradientButton>
          </section>
        ) : null}

        {step === "premium" ? (
          <section className="relative z-10 flex min-h-screen flex-col justify-between gap-8 pb-3">
            <div>
              <PremiumVisual />
              <div className="space-y-8 text-center">
                <div className="mx-auto inline-flex -skew-x-12 rounded-sm bg-[linear-gradient(135deg,#45b5ff,#6d28d9)] px-7 py-2">
                  <span className="skew-x-12 text-sm font-black uppercase text-white">Premium</span>
                </div>
                <div className="space-y-4">
                  <h1 className="bg-[linear-gradient(135deg,#4f9fff,#6d5dfc,#8b5cf6)] bg-clip-text text-4xl font-black leading-tight text-transparent">
                    Lerne ohne Begrenzung
                  </h1>
                  <p className="text-2xl font-black leading-9 text-white">
                    Schalte SimplyLaw Campus vollständig frei.
                  </p>
                  <p className="text-base leading-7 text-slate-400">
                    Schalte alle Kurse, Lernpläne, Karteikarten und Prüfungssimulationen frei und lerne ohne Begrenzung.
                  </p>
                </div>
              </div>
              <div className="mt-9 space-y-5 text-left">
                {["Alle Kurse freischalten", "Prüfungssimulationen nutzen", "Fortschritt speichern", "Karteikarten und Lernpläne verwenden"].map(
                  (item) => (
                    <div key={item} className="flex gap-4 text-lg font-bold leading-8 text-slate-300">
                      <span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand/25 text-sm text-brand-100">✓</span>
                      <span>{item}</span>
                    </div>
                  )
                )}
              </div>
            </div>
            <div className="space-y-5">
              <GradientButton type="submit">Kostenlose Probewoche starten</GradientButton>
              <button
                type="submit"
                className="w-full py-2 text-center text-base font-black text-brand-300 transition hover:text-white focus:outline-none focus:ring-4 focus:ring-brand/20"
              >
                Vielleicht später
              </button>
            </div>
          </section>
        ) : null}
      </form>
    </main>
  );
}
