# SimplyLaw Campus

Schlankes LMS-MVP für SimplyLaw mit Next.js, TypeScript, Tailwind CSS und Supabase. Der Fokus liegt auf Login, Kursen, Lektionen, Quizzen, Fortschritt und einem einfachen Adminbereich.

## Start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Die App läuft danach lokal unter `http://localhost:3000`.

## Supabase-Umgebungsvariablen

In `.env.local` werden benötigt:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Es wird bewusst kein Service-Role-Key in der App verwendet. Admin-Rechte laufen über die Tabelle `profiles` und RLS-Policies.

Für Vercel Production muss `NEXT_PUBLIC_SITE_URL` auf die echte HTTPS-Domain zeigen, z. B.:

```bash
NEXT_PUBLIC_SITE_URL=https://simplylaw-campus.vercel.app
```

In Supabase Auth sollten außerdem diese URLs hinterlegt sein:

- Site URL: `https://simplylaw-campus.vercel.app`
- Redirect URL Production: `https://simplylaw-campus.vercel.app/auth/callback`
- Redirect URL lokal: `http://localhost:3000/auth/callback`

## Datenbank einrichten

Führe die SQL-Migrationen in dieser Reihenfolge in Supabase aus:

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_seed_sample_content.sql`
3. `supabase/migrations/003_add_profile_onboarding.sql`
4. `supabase/migrations/004_repair_profile_onboarding_persistence.sql`
5. `supabase/migrations/005_admin_cms.sql`
6. `supabase/migrations/006_course_trash_soft_delete.sql`

Erstellt werden:

- `profiles`
- `courses`
- `lessons`
- `lesson_progress`
- `quizzes`
- `questions`
- `answers`
- `quiz_results`
- `course_enrollments`
- `modules`
- `media_assets`
- `entitlements`

Zusätzlich richten die Migrationen Rollen, RLS-Policies, Trigger, Indizes sowie die Storage-Buckets `lesson-files` und `course-media` ein.
Migration `006_course_trash_soft_delete.sql` ergänzt den Admin-Papierkorb für Kurse über `deleted_at` und `deleted_by`.

## Admin-Nutzer festlegen

Neue Registrierungen erhalten automatisch die Rolle `student`. Nach der Registrierung kann ein Nutzer in Supabase per SQL zum Admin gemacht werden:

```sql
update public.profiles
set role = 'admin'
where id = (
  select id
  from auth.users
  where email = 'admin@example.com'
);
```

Danach ist `/admin` sichtbar und nutzbar. Admin-CMS 1.0 bietet eigene Bereiche für Kurse, Module, Lektionen, Medien, Quiz, Nutzer, Freischaltungen und spätere Zahlungen.

## Projektstruktur

```text
src/app                 Next.js App Router Seiten und Server Actions
src/components          Wiederverwendbare UI-Komponenten
src/lib                 Supabase-Clients, Auth-Helfer, Queries, Formatierung
src/types               Datenbanktypen
supabase/migrations     SQL-Schema und Beispielinhalte
```

## Designsystem

Die zentralen Design Tokens liegen in `tailwind.config.ts` und `src/app/globals.css`. Wiederverwendbare UI-Bausteine liegen in `src/components`, darunter `Button`, `Card`, `Badge`, `ProgressBar`, `PageHeader`, `SectionTitle`, `CourseCard`, `DashboardShell` und `MobileNavigation`.

Der öffentliche Coming-Soon-Modus bleibt über `src/lib/site-mode.ts` aktiv. Wenn `COMING_SOON_MODE` später auf `false` gesetzt wird, werden die vorbereiteten LMS-Layouts wieder sichtbar.

## MVP-Funktionen

- Landingpage mit SimplyLaw Campus, Login und Kursübersicht
- Registrierung, Login, Logout und Passwort-Reset über Supabase Auth
- Dashboard mit freigeschalteten Kursen und Fortschritt
- Kursübersicht, Kursdetails und Lektionsseiten
- PDF-Downloads, Video-URL und Lektionstext
- Multiple-Choice-Quiz mit Ergebnis-Speicherung
- Adminbereich für Kurse, Lektionen, Quizfragen, Video-URLs und PDF-Uploads
