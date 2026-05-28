export type CourseCatalogTone = "criminal-law" | "intervention" | "traffic" | "forensics" | "method";

export type CourseCatalogLesson = {
  title: string;
  durationMinutes: number;
};

export type CourseCatalogModule = {
  title: string;
  lessons: CourseCatalogLesson[];
};

export type CourseCatalogEntry = {
  slug: string;
  aliases: string[];
  title: string;
  description: string;
  category: string;
  tone: CourseCatalogTone;
  modules: CourseCatalogModule[];
};

export const courseCatalog: CourseCatalogEntry[] = [
  {
    slug: "strafrecht",
    aliases: ["strafrecht-grundlagen"],
    title: "Strafrecht",
    description: "Lerne die strafrechtliche Fallbearbeitung vom Grundaufbau bis zum Klausurtraining.",
    category: "Strafrecht",
    tone: "criminal-law",
    modules: [
      {
        title: "Grundlagen",
        lessons: [
          { title: "Aufbau der Strafbarkeit", durationMinutes: 12 },
          { title: "Objektiver und subjektiver Tatbestand", durationMinutes: 14 }
        ]
      },
      {
        title: "Tatbestand",
        lessons: [
          { title: "Tatbestandsmerkmale erkennen", durationMinutes: 13 },
          { title: "Vorsatz und Fahrlässigkeit abgrenzen", durationMinutes: 11 }
        ]
      },
      {
        title: "Rechtswidrigkeit",
        lessons: [
          { title: "Rechtfertigungsgründe prüfen", durationMinutes: 12 },
          { title: "Notwehr im Einsatzkontext", durationMinutes: 15 }
        ]
      },
      {
        title: "Schuld",
        lessons: [
          { title: "Schuldfähigkeit und Entschuldigungen", durationMinutes: 10 },
          { title: "Irrtümer sauber einordnen", durationMinutes: 12 }
        ]
      },
      {
        title: "Versuch",
        lessons: [
          { title: "Prüfung des Versuchs", durationMinutes: 13 },
          { title: "Rücktritt vom Versuch", durationMinutes: 14 }
        ]
      },
      {
        title: "Täterschaft und Teilnahme",
        lessons: [
          { title: "Mittäterschaft und Beihilfe", durationMinutes: 12 },
          { title: "Abgrenzung in Klausurfällen", durationMinutes: 15 }
        ]
      },
      {
        title: "Vermögensdelikte",
        lessons: [
          { title: "Diebstahl im Grundaufbau", durationMinutes: 14 },
          { title: "Betrug und Vermögensverfügung", durationMinutes: 16 }
        ]
      },
      {
        title: "Klausurtraining",
        lessons: [
          { title: "Kurzfall systematisch lösen", durationMinutes: 18 },
          { title: "Gutachtenstil unter Zeitdruck", durationMinutes: 15 }
        ]
      }
    ]
  },
  {
    slug: "eingriffsrecht",
    aliases: ["eingriffsrecht-grundlagen"],
    title: "Eingriffsrecht",
    description: "Trainiere Befugnisse, Verhältnismäßigkeit und rechtssichere Maßnahmen.",
    category: "Eingriffsrecht",
    tone: "intervention",
    modules: [
      {
        title: "Grundlagen der Gefahrenabwehr",
        lessons: [
          { title: "Gefahr, Störer und Zuständigkeit", durationMinutes: 13 },
          { title: "Eingriffsvoraussetzungen prüfen", durationMinutes: 12 }
        ]
      },
      {
        title: "Befugnisnormen",
        lessons: [
          { title: "Die passende Rechtsgrundlage finden", durationMinutes: 14 },
          { title: "Standardmaßnahmen einordnen", durationMinutes: 11 }
        ]
      },
      {
        title: "Verhältnismäßigkeit",
        lessons: [
          { title: "Geeignetheit und Erforderlichkeit", durationMinutes: 10 },
          { title: "Angemessenheit begründen", durationMinutes: 13 }
        ]
      },
      {
        title: "Identitätsfeststellung",
        lessons: [
          { title: "Voraussetzungen und Ablauf", durationMinutes: 12 },
          { title: "Dokumentation der Maßnahme", durationMinutes: 10 }
        ]
      },
      {
        title: "Durchsuchung",
        lessons: [
          { title: "Personen und Sachen durchsuchen", durationMinutes: 13 },
          { title: "Grenzen und Schutzbereiche", durationMinutes: 12 }
        ]
      },
      {
        title: "Platzverweis",
        lessons: [
          { title: "Platzverweis rechtssicher anordnen", durationMinutes: 11 },
          { title: "Folgen und Durchsetzung", durationMinutes: 10 }
        ]
      },
      {
        title: "Gewahrsam",
        lessons: [
          { title: "Voraussetzungen des Gewahrsams", durationMinutes: 14 },
          { title: "Richtervorbehalt und Dauer", durationMinutes: 12 }
        ]
      },
      {
        title: "Falltraining",
        lessons: [
          { title: "Einsatzlage Schritt für Schritt", durationMinutes: 18 },
          { title: "Abwägung formulieren", durationMinutes: 15 }
        ]
      }
    ]
  },
  {
    slug: "verkehrsrecht",
    aliases: ["verkehrsrecht-grundlagen"],
    title: "Verkehrsrecht",
    description: "Verstehe Verkehrskontrollen, Ordnungswidrigkeiten und typische Einsatzlagen.",
    category: "Verkehrsrecht",
    tone: "traffic",
    modules: [
      {
        title: "Grundlagen",
        lessons: [
          { title: "Systematik des Verkehrsrechts", durationMinutes: 10 },
          { title: "Kontrollbefugnisse im Überblick", durationMinutes: 12 }
        ]
      },
      {
        title: "Verkehrskontrolle",
        lessons: [
          { title: "Ablauf einer Kontrolle", durationMinutes: 12 },
          { title: "Dokumentation und Belehrung", durationMinutes: 11 }
        ]
      },
      {
        title: "Ordnungswidrigkeiten",
        lessons: [
          { title: "Tatbestand und Rechtsfolge", durationMinutes: 13 },
          { title: "Regelbeispiele einordnen", durationMinutes: 10 }
        ]
      },
      {
        title: "Alkohol und Drogen",
        lessons: [
          { title: "Auffälligkeiten erkennen", durationMinutes: 12 },
          { title: "Maßnahmen und Nachweise", durationMinutes: 14 }
        ]
      },
      {
        title: "Zulassung",
        lessons: [
          { title: "Fahrzeugpapiere prüfen", durationMinutes: 9 },
          { title: "Mängel und Untersagung", durationMinutes: 11 }
        ]
      },
      {
        title: "Fahrerlaubnis",
        lessons: [
          { title: "Fahrerlaubnisklassen verstehen", durationMinutes: 10 },
          { title: "Fahren ohne Fahrerlaubnis", durationMinutes: 12 }
        ]
      },
      {
        title: "Unfallaufnahme",
        lessons: [
          { title: "Erstmaßnahmen am Unfallort", durationMinutes: 13 },
          { title: "Beweise und Skizzen sichern", durationMinutes: 15 }
        ]
      },
      {
        title: "Falltraining",
        lessons: [
          { title: "Kontrollsituation lösen", durationMinutes: 16 },
          { title: "Unfalllage rechtlich bewerten", durationMinutes: 18 }
        ]
      }
    ]
  },
  {
    slug: "kriminalistik",
    aliases: [],
    title: "Kriminalistik",
    description: "Baue kriminalistisches Denken von der Tatortarbeit bis zur Fallanalyse auf.",
    category: "Kriminalistik",
    tone: "forensics",
    modules: [
      {
        title: "Grundlagen",
        lessons: [
          { title: "Kriminalistische Denkweise", durationMinutes: 12 },
          { title: "Hypothesen bilden und prüfen", durationMinutes: 14 }
        ]
      },
      {
        title: "Tatortarbeit",
        lessons: [
          { title: "Tatort sichern", durationMinutes: 13 },
          { title: "Abläufe am Tatort strukturieren", durationMinutes: 12 }
        ]
      },
      {
        title: "Spurenkunde",
        lessons: [
          { title: "Spurenarten unterscheiden", durationMinutes: 11 },
          { title: "Spuren sichern und bewerten", durationMinutes: 15 }
        ]
      },
      {
        title: "Vernehmung",
        lessons: [
          { title: "Gesprächsführung vorbereiten", durationMinutes: 12 },
          { title: "Aussagen dokumentieren", durationMinutes: 10 }
        ]
      },
      {
        title: "Ermittlungsansätze",
        lessons: [
          { title: "Ansätze priorisieren", durationMinutes: 13 },
          { title: "Informationen zusammenführen", durationMinutes: 14 }
        ]
      },
      {
        title: "Dokumentation",
        lessons: [
          { title: "Ermittlungsvermerke schreiben", durationMinutes: 11 },
          { title: "Beweiskette nachvollziehbar halten", durationMinutes: 12 }
        ]
      },
      {
        title: "Fallanalyse",
        lessons: [
          { title: "Fallmuster erkennen", durationMinutes: 16 },
          { title: "Ermittlungsplan entwickeln", durationMinutes: 18 }
        ]
      }
    ]
  }
];

export function findCatalogCourse(value?: string | null) {
  if (!value) {
    return null;
  }

  return courseCatalog.find((course) => course.slug === value || course.aliases.includes(value)) || null;
}

export function getAvailableCoursePreviews() {
  return courseCatalog.map(({ slug, title, description, tone }) => ({
    title,
    description,
    tone,
    href: `/courses/${slug}`
  }));
}
