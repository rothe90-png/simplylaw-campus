import Link from "next/link";
import { FiBookOpen, FiCreditCard, FiFileText, FiImage, FiLayers, FiLock, FiUsers, FiZap } from "react-icons/fi";
import { AdminKicker, AdminPanel, AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/auth";
import { getAdminDashboardStats } from "@/lib/queries";

const tiles = [
  { href: "/admin/courses", label: "Kurse", description: "Katalog, Status, Preise und Reihenfolge", icon: FiBookOpen, statKey: "courses" },
  { href: "/admin/courses", label: "Module", description: "Kapitelstruktur je Kurs vorbereiten", icon: FiLayers, statKey: "modules" },
  { href: "/admin/courses", label: "Lektionen", description: "Texte, Videos, PDFs und Preview-Status", icon: FiFileText, statKey: "lessons" },
  { href: "/admin/media", label: "Medien", description: "Bilder, PDFs und Video-Links verwalten", icon: FiImage, statKey: "media" },
  { href: "/admin/quizzes", label: "Quiz", description: "Tests und Fragenmodell vorbereiten", icon: FiZap, statKey: "quizzes" },
  { href: "/admin/users", label: "Nutzer", description: "Support-Ansicht, Rollen und Onboarding", icon: FiUsers, statKey: "users" },
  { href: "/admin/entitlements", label: "Freischaltungen", description: "Zugriffe für Payment-Webhooks vorbereiten", icon: FiLock, statKey: "entitlements" },
  { href: "/admin/payments", label: "Zahlungen/Abo später", description: "Stripe, PayPal, Apple Pay und Google Pay", icon: FiCreditCard, statKey: null }
] as const;

export default async function AdminPage() {
  const [{ profile, user }, stats] = await Promise.all([requireAdmin(), getAdminDashboardStats()]);
  const name = profile.username || profile.full_name || user.email?.split("@")[0] || "Admin";

  return (
    <AdminShell userName={name} active="overview">
      <section className="space-y-7">
        <AdminPanel className="overflow-hidden bg-[linear-gradient(135deg,rgba(0,76,145,0.28),rgba(93,63,211,0.18)_50%,rgba(255,255,255,0.055))]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <AdminKicker>Admin-CMS 1.0</AdminKicker>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">SimplyLaw Campus verwalten</h1>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Inhalte, Module und spätere Freischaltungen zentral vorbereiten. Nutzerzugriffe bleiben für Payment-Webhooks
                erweiterbar.
              </p>
            </div>
            <Link
              href="/admin/courses/new"
              prefetch={false}
              className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-white px-5 text-sm font-bold text-[#06101f] transition hover:-translate-y-0.5 hover:bg-brand-50"
            >
              Kurs erstellen
            </Link>
          </div>
        </AdminPanel>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {tiles.map((tile) => {
            const Icon = tile.icon;
            const stat = tile.statKey ? stats[tile.statKey] : "später";
            return (
              <Link
                key={tile.label}
                href={tile.href}
                prefetch={false}
                className="group rounded-[1.6rem] border border-white/10 bg-white/[0.055] p-5 shadow-[0_20px_55px_rgba(0,0,0,0.24)] transition hover:-translate-y-1 hover:border-brand-200/35 hover:bg-white/[0.08]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/22 text-brand-100 shadow-[0_0_28px_rgba(0,76,145,0.24)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-bold text-slate-300">
                    {stat}
                  </span>
                </div>
                <h2 className="mt-5 text-xl font-bold text-white">{tile.label}</h2>
                <p className="mt-2 min-h-12 text-sm leading-6 text-slate-400">{tile.description}</p>
                <p className="mt-5 text-sm font-bold text-brand-100 transition group-hover:text-white">Öffnen</p>
              </Link>
            );
          })}
        </div>
      </section>
    </AdminShell>
  );
}
