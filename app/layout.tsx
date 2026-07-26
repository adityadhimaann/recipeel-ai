import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import { Toaster } from "sonner";
import { PageTransition } from "@/components/page-transition";
import "@/styles.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "ReciPeel — AI recipe import, dietary safety & meal planning",
  description:
    "Import recipes from TikTok, Instagram and YouTube. Auto-detect diet and allergy conflicts, swap ingredients safely, and plan your week — all in one warm, calm space.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "ReciPeel — Cook it your way",
    description:
      "AI-powered recipe import, allergy-aware substitutions, weekly planning and smart grocery lists.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="flex min-h-screen flex-col">
        <PageTransition>{children}</PageTransition>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
