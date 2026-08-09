import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Compliance Wiki — Frameworks, Controls & Change Tracker",
  description:
    "A single source of truth for compliance frameworks, their controls, and every change across the industry.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <header className="site-header">
          <Link href="/" className="brand">
            Compliance<span>Wiki</span>
          </Link>
          <nav className="site-nav">
            <Link href="/frameworks">Frameworks</Link>
            <Link href="/changes">Change Log</Link>
            <Link href="/subscribe" className="btn">
              Subscribe
            </Link>
          </nav>
        </header>
        <main className="container">{children}</main>
        <footer className="site-footer">
          <p>Compliance Wiki — community-curated. Verify against official sources before relying on any control text.</p>
        </footer>
      </body>
    </html>
  );
}
