import { Badge } from "@/components/badge";
import { ButtonLink } from "@/components/button";
import { Card } from "@/components/card";

type CoursePreviewTone = "criminal-law" | "intervention" | "traffic" | "forensics";

const visualStyles: Record<CoursePreviewTone, { label: string; className: string }> = {
  "criminal-law": {
    label: "StGB",
    className: "bg-gradient-to-br from-brand-700 to-brand-500 text-white"
  },
  intervention: {
    label: "E",
    className: "bg-gradient-to-br from-slate-200 to-brand-50 text-brand"
  },
  traffic: {
    label: "V",
    className: "bg-gradient-to-br from-sky-100 to-cyan-50 text-brand"
  },
  forensics: {
    label: "K",
    className: "bg-gradient-to-br from-indigo-100 to-white text-brand"
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
    <Card className="flex h-full overflow-hidden rounded-ui-lg transition hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-soft">
      <div className={`flex h-32 items-center justify-center ${visual.className}`}>
        <div className="flex h-16 w-16 items-center justify-center rounded-ui-lg bg-white/80 text-2xl font-bold shadow-card backdrop-blur">
          {visual.label}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="space-y-3">
          <Badge variant="neutral">Noch nicht freigeschaltet</Badge>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-ink">{title}</h3>
            <p className="text-body-sm text-slate-600">{description}</p>
          </div>
        </div>
        <ButtonLink className="mt-auto" fullWidth variant="secondary" href={href}>
          Kurs ansehen
        </ButtonLink>
      </div>
    </Card>
  );
}
