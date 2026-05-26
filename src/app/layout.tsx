import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/header";

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
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}
