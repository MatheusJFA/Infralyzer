import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Infralyzer - Infrastructure Sizing & Cost Prediction",
  description: "Transform business metrics into cloud infrastructure requirements.",
};

import { I18nProvider } from "@/lib/i18n/I18nContext";
import { Footer } from "@/components/ui/Footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={spaceGrotesk.className}>
        <I18nProvider>
          <div className="min-h-screen bg-background text-foreground flex flex-col">
            <main className="flex-grow">
              {children}
            </main>
          </div>
        </I18nProvider>
      </body>
    </html>
  );
}
