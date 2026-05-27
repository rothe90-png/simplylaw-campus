import { Badge } from "@/components/badge";
import { ButtonLink } from "@/components/button";
import { Card } from "@/components/card";

type CoursePreviewTone = "criminal-law" | "intervention" | "traffic" | "forensics";

const visualStyles: Record<CoursePreviewTone, { label: string; className: string }> = {
  "criminal-law": {
    label: "StGB",
    className: "bg-gradient-to-br from-brand-700 via-brand-600 to-violet-700 text-white"
  },
  intervention: {
    label: "E",
    className: "bg-gradient-to-br from-slate-900 via-brand-900 to-slate-700 text-white"
  },
  traffic: {
    label: "V",
    className: "bg-gradient-to-br from-sky-900 via-brand-800 to-cyan-700 text-white"
  },
  forensics: {
    label: "K",
    className: "bg-gradient-to-br from-indigo-950 via-brand-900 to-slate-800 text-white"
  }
};

type CoursePreviewCardProps = {
  title: string;
  description: string;
  tone: CoursePreviewTone;
  href?: string;
};

export function CoursePreviewCard({ title, description, tone, href = "/courses" }: CoursePreviewCardProps) {
  const visual = visualStyles[tone];

  return (
    <Card className="flex h-full overflow-hidden rounded-[1.5rem] border-white/10 bg-white/[0.06] shadow-[0_20px_60px_rgba(0,0,0,0.28)] transition hover:-translate-y-0.5 hover:border-brand/40 hover:bg-white/[0.08]">
      <div className={`relative flex h-36 items-center justify-center overflow-hidden ${visual.className}`}>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.05),rgba(0,0,0,0.45))]" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-white/15 text-2xl font-bold shadow-[0_0_40px_rgba(0,76,145,0.45)] backdrop-blur">
          {visual.label}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="space-y-3">
          <Badge variant="neutral">Noch nicht freigeschaltet</Badge>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <p className="text-body-sm text-slate-400">{description}</p>
          </div>
        </div>
        <ButtonLink className="mt-auto" fullWidth variant="glass" href={href}>
          Kurs ansehen
        </ButtonLink>
      </div>
    </Card>
  );
}
