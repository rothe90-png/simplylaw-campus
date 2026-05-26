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

## Datenbank einrichten

Führe die SQL-Migrationen in dieser Reihenfolge in Supabase aus:

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_seed_sample_content.sql`

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

Zusätzlich richtet die Migration Rollen, RLS-Policies, Trigger, Indizes und den privaten Storage-Bucket `lesson-files` für PDF-Dateien ein.

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

Danach ist `/admin` sichtbar und nutzbar.

## Projektstruktur

```text
src/app                 Next.js App Router Seiten und Server Actions
src/components          Wiederverwendbare UI-Komponenten
src/lib                 Supabase-Clients, Auth-Helfer, Queries, Formatierung
src/types               Datenbanktypen
supabase/migrations     SQL-Schema und Beispielinhalte
```

## MVP-Funktionen

- Landingpage mit SimplyLaw Campus, Login und Kursübersicht
- Registrierung, Login, Logout und Passwort-Reset über Supabase Auth
- Dashboard mit freigeschalteten Kursen und Fortschritt
- Kursübersicht, Kursdetails und Lektionsseiten
- PDF-Downloads, Video-URL und Lektionstext
- Multiple-Choice-Quiz mit Ergebnis-Speicherung
- Adminbereich für Kurse, Lektionen, Quizfragen, Video-URLs und PDF-Uploads
