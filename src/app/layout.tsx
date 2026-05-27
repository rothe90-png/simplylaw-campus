import type { Metadata } from "next";
import "./globals.css";
import { ComingSoon } from "@/components/coming-soon";
import { Header } from "@/components/header";
import { COMING_SOON_MODE } from "@/lib/site-mode";

export const metadata: Metadata = {
  title: "SimplyLaw Campus",
  description: "Schlankes LMS für SimplyLaw Kurse, Lektionen und Quizze."
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
          <ComingSoon />
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
