import { createAdminMediaAsset } from "@/app/actions";
import { AdminSelect, AdminSubmitButton, AdminTextArea, AdminTextInput } from "@/components/admin/admin-fields";
import { AdminKicker, AdminPanel, AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/auth";
import { getAdminMediaAssets } from "@/lib/queries";

export default async function AdminMediaPage() {
  const [{ profile, user }, assets] = await Promise.all([requireAdmin(), getAdminMediaAssets()]);
  const name = profile.username || profile.full_name || user.email?.split("@")[0] || "Admin";

  return (
    <AdminShell userName={name} active="media">
      <section className="space-y-6">
        <div>
          <AdminKicker>Medienverwaltung</AdminKicker>
          <h1 className="mt-2 text-3xl font-bold text-white">Medien</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Für 1.0 werden Medien per URL gepflegt. Der Bucket <code className="text-brand-100">course-media</code> ist vorbereitet;
            Uploads können später ergänzt werden.
          </p>
        </div>

        <AdminPanel>
          <h2 className="text-xl font-bold text-white">Medienlink hinzufügen</h2>
          <form action={createAdminMediaAsset} className="mt-4 grid gap-4 md:grid-cols-2">
            <AdminTextInput label="Titel" name="title" required />
            <AdminSelect label="Typ" name="type" defaultValue="image">
              <option value="image">Bild</option>
              <option value="video">Video</option>
              <option value="pdf">PDF</option>
            </AdminSelect>
            <AdminTextInput label="URL" name="url" required className="md:col-span-2" />
            <AdminTextArea label="Beschreibung" name="description" rows={3} className="md:col-span-2" />
            <div className="md:col-span-2">
              <AdminSubmitButton>Medium speichern</AdminSubmitButton>
            </div>
          </form>
        </AdminPanel>

        <div className="grid gap-4 md:grid-cols-2">
          {assets.map((asset) => (
            <AdminPanel key={asset.id}>
              <span className="rounded-full bg-white/[0.07] px-3 py-1 text-xs font-bold text-slate-300">{asset.type}</span>
              <h2 className="mt-4 text-xl font-bold text-white">{asset.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">{asset.description || "Keine Beschreibung hinterlegt."}</p>
              <a className="mt-4 block truncate text-sm font-bold text-brand-100 hover:text-white" href={asset.url} target="_blank" rel="noreferrer">
                {asset.url}
              </a>
            </AdminPanel>
          ))}
        </div>

        {!assets.length ? (
          <AdminPanel>
            <h2 className="text-xl font-bold text-white">Noch keine Medien</h2>
            <p className="mt-2 text-sm text-slate-400">Füge Medienlinks hinzu oder ergänze später den Supabase-Storage-Upload.</p>
          </AdminPanel>
        ) : null}
      </section>
    </AdminShell>
  );
}
