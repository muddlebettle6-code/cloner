import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ORG } from "@/content/site";

const neueHaas = localFont({
  src: [
    { path: "../../public/fonts/NeueHaasUnica-Regular.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/NeueHaasUnica-Regular.woff", weight: "400", style: "normal" },
  ],
  variable: "--font-neue",
  display: "swap",
});

const akkurat = localFont({
  src: [
    { path: "../../public/fonts/Akkurat-Mono.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/Akkurat-Mono.woff", weight: "400", style: "normal" },
  ],
  variable: "--font-akkurat",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://cumulant.org"),
  title: {
    default: ORG.name,
    template: `%s · ${ORG.name}`,
  },
  description: ORG.description,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${neueHaas.variable} ${akkurat.variable} antialiased`}
    >
      <body className="min-h-screen bg-cream text-ink font-sans overflow-x-hidden">
        <a
          href="#top"
          className="sr-only focus:not-sr-only focus:absolute focus:left-[12px] focus:top-[12px] focus:z-[100] focus:rounded-[5px] focus:bg-ink focus:px-[16px] focus:py-[10px] focus:font-mono focus:text-[12px] focus:uppercase focus:text-white"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
