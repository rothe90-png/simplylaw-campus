insert into public.courses (title, slug, description, category, position, is_published)
values
  (
    'Gutachtenstil Polizei',
    'gutachtenstil-polizei',
    'Praxisnaher Einstieg in Aufbau, Subsumtion und saubere rechtliche Argumentation fuer polizeiliche Fallbearbeitung.',
    'Methodik',
    1,
    true
  ),
  (
    'Strafrecht Grundlagen',
    'strafrecht-grundlagen',
    'Grundbegriffe des Strafrechts, Tatbestand, Rechtswidrigkeit, Schuld und typische Pruefungsschritte.',
    'Strafrecht',
    2,
    true
  ),
  (
    'Eingriffsrecht Grundlagen',
    'eingriffsrecht-grundlagen',
    'Grundlagen zu Befugnissen, Verhaeltnismaessigkeit und rechtssicherem Vorgehen bei Eingriffsmassnahmen.',
    'Eingriffsrecht',
    3,
    true
  ),
  (
    'Verkehrsrecht Grundlagen',
    'verkehrsrecht-grundlagen',
    'Basiswissen zu Verkehrskontrollen, Ordnungswidrigkeiten und rechtlichen Standardlagen im Strassenverkehr.',
    'Verkehrsrecht',
    4,
    true
  )
on conflict (slug) do update
set
  title = excluded.title,
  description = excluded.description,
  category = excluded.category,
  position = excluded.position,
  is_published = excluded.is_published;

insert into public.lessons (course_id, title, slug, description, body, position, duration_minutes)
select courses.id, seed.title, seed.slug, seed.description, seed.body, seed.position, seed.duration_minutes
from public.courses
join (
  values
    ('gutachtenstil-polizei', 'Aufbau eines Gutachtens', 'aufbau-eines-gutachtens', 'Obersatz, Definition, Subsumtion und Ergebnis sicher anwenden.', 'In dieser Lektion lernst du den klassischen Gutachtenaufbau kennen und uebertraegst ihn auf polizeiliche Sachverhalte.', 1, 12),
    ('gutachtenstil-polizei', 'Subsumtion praezise formulieren', 'subsumtion-praezise-formulieren', 'Sachverhalt und Norm sauber miteinander verbinden.', 'Der Schwerpunkt liegt auf klaren Formulierungen, die zeigen, warum ein Tatbestandsmerkmal erfuellt oder nicht erfuellt ist.', 2, 14),
    ('gutachtenstil-polizei', 'Haeufige Fehler vermeiden', 'haeufige-fehler-vermeiden', 'Typische Brueche im Gutachtenstil erkennen und verbessern.', 'Du pruefst Beispielsaetze und formulierst sie in einen stringent aufgebauten Gutachtenstil um.', 3, 10),
    ('strafrecht-grundlagen', 'Tatbestand verstehen', 'tatbestand-verstehen', 'Objektive und subjektive Merkmale unterscheiden.', 'Diese Lektion fuehrt in die Pruefung des Tatbestands ein und zeigt, wie einzelne Merkmale strukturiert bearbeitet werden.', 1, 11),
    ('strafrecht-grundlagen', 'Rechtswidrigkeit und Schuld', 'rechtswidrigkeit-und-schuld', 'Die zweite und dritte Pruefungsstufe sicher einordnen.', 'Du lernst, wann Rechtfertigungsgruende relevant werden und wie die Schuldpruefung im Grundaufbau funktioniert.', 2, 13),
    ('strafrecht-grundlagen', 'Fallpruefung Schritt fuer Schritt', 'fallpruefung-schritt-fuer-schritt', 'Einen einfachen Strafrechtsfall vollstaendig loesen.', 'An einem Beispielsachverhalt fuehrst du die Pruefung von Tatbestand, Rechtswidrigkeit und Schuld zusammen.', 3, 15),
    ('eingriffsrecht-grundlagen', 'Befugnisnormen finden', 'befugnisnormen-finden', 'Die richtige Rechtsgrundlage fuer polizeiliches Handeln bestimmen.', 'Diese Lektion zeigt, wie du Ausgangslage, Zielrichtung und Rechtsgrundlage eines Eingriffs sauber klaerst.', 1, 12),
    ('eingriffsrecht-grundlagen', 'Verhaeltnismaessigkeit pruefen', 'verhaeltnismaessigkeit-pruefen', 'Geeignetheit, Erforderlichkeit und Angemessenheit anwenden.', 'Du trainierst die klassische Verhaeltnismaessigkeitspruefung anhand kurzer Standardsituationen.', 2, 14),
    ('eingriffsrecht-grundlagen', 'Dokumentation von Massnahmen', 'dokumentation-von-massnahmen', 'Rechtliche Entscheidungen nachvollziehbar festhalten.', 'Hier geht es um klare, belastbare Dokumentation von Eingriffsvoraussetzungen und Abwaegungen.', 3, 9),
    ('verkehrsrecht-grundlagen', 'Verkehrskontrolle vorbereiten', 'verkehrskontrolle-vorbereiten', 'Rechtsgrundlagen und Ablauf einer Kontrolle strukturieren.', 'Du lernst, welche Punkte vor und waehrend einer Kontrolle rechtlich sauber bedacht werden sollten.', 1, 10),
    ('verkehrsrecht-grundlagen', 'Ordnungswidrigkeiten einordnen', 'ordnungswidrigkeiten-einordnen', 'Typische Verkehrsverstoesse rechtlich einordnen.', 'Diese Lektion erklaert Grundbegriffe und typische Pruefschritte bei verkehrsrechtlichen Ordnungswidrigkeiten.', 2, 12),
    ('verkehrsrecht-grundlagen', 'Massnahmen im Strassenverkehr', 'massnahmen-im-strassenverkehr', 'Befugnisse, Grenzen und Dokumentation verkehrsrechtlicher Massnahmen.', 'Du verbindest Verkehrsrecht und Eingriffsrecht in typischen Einsatzsituationen.', 3, 13)
) as seed(course_slug, title, slug, description, body, position, duration_minutes)
on courses.slug = seed.course_slug
on conflict (course_id, slug) do update
set
  title = excluded.title,
  description = excluded.description,
  body = excluded.body,
  position = excluded.position,
  duration_minutes = excluded.duration_minutes;

do $$
declare
  course_record record;
  quiz_id uuid;
  question_one_id uuid;
  question_two_id uuid;
begin
  for course_record in
    select id, title, slug from public.courses
    where slug in ('gutachtenstil-polizei', 'strafrecht-grundlagen', 'eingriffsrecht-grundlagen', 'verkehrsrecht-grundlagen')
  loop
    insert into public.quizzes (course_id, title, passing_score)
    values (course_record.id, 'Quiz: ' || course_record.title, 70)
    on conflict (course_id) do update
    set title = excluded.title,
        passing_score = excluded.passing_score
    returning id into quiz_id;

    insert into public.questions (quiz_id, prompt, position)
    values (quiz_id, 'Welche Aussage passt am besten zu diesem Kurs?', 1)
    returning id into question_one_id;

    insert into public.answers (question_id, answer_text, is_correct, position)
    values
      (question_one_id, 'Rechtsfragen werden strukturiert anhand der einschlaegigen Voraussetzungen geprueft.', true, 1),
      (question_one_id, 'Eine Begruendung ist nur erforderlich, wenn das Ergebnis unklar bleibt.', false, 2),
      (question_one_id, 'Die Reihenfolge der Pruefung ist fuer die Loesung ohne Bedeutung.', false, 3),
      (question_one_id, 'Downloads ersetzen die Bearbeitung der Lektionen vollstaendig.', false, 4);

    insert into public.questions (quiz_id, prompt, position)
    values (quiz_id, 'Was ist ein sinnvolles Vorgehen beim Lernen?', 2)
    returning id into question_two_id;

    insert into public.answers (question_id, answer_text, is_correct, position)
    values
      (question_two_id, 'Lektion bearbeiten, Kerngedanken wiederholen und den Fortschritt dokumentieren.', true, 1),
      (question_two_id, 'Nur das Quiz starten und die Lektionen ueberspringen.', false, 2),
      (question_two_id, 'Antworten zufaellig auswaehlen, um schneller fertig zu werden.', false, 3),
      (question_two_id, 'PDF-Dateien hochladen, ohne den Inhalt zu pruefen.', false, 4);
  end loop;
end $$;
