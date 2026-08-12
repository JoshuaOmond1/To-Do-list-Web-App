import type { Metadata } from "next";
import { headers } from "next/headers";
import { DM_Sans, Lora } from "next/font/google";
import "./globals.css";

const sans = DM_Sans({ variable: "--font-sans", subsets: ["latin"] });
const serif = Lora({ variable: "--font-serif", subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost";
  const protocol = host.includes("localhost") ? "http" : "https";
  const base = new URL(`${protocol}://${host}`);
  return {
    metadataBase: base,
    title: "Daymark — Make today feel doable",
    description: "A calm, private to-do list that helps you focus on what matters today.",
    openGraph: { title: "Daymark", description: "Make today feel doable.", images: [{ url: new URL("/og.png", base), width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title: "Daymark", description: "Make today feel doable.", images: [new URL("/og.png", base)] },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className={`${sans.variable} ${serif.variable}`}>{children}</body></html>;
}
