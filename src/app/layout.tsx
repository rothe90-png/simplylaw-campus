import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/header";
import { COMING_SOON_MODE } from "@/lib/site-mode";

export const metadata: Metadata = {
  title: "SimplyLaw Campus",
  description: "Schlankes LMS für SimplyLaw Kurse, Lektionen und Quizze.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body>
        {COMING_SOON_MODE ? (
          children
        ) : (
          <>
            <Header />
            <main>{children}</main>
          </>
        )}
      </body>
    </html>
  );
}