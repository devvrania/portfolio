import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { site } from "@/content/site";
import { splashScript } from "@/components/splash";
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
  metadataBase: new URL(site.url),
  title: `${site.name} · Software Engineer`,
  description: site.tagline,
  openGraph: {
    title: `${site.name} · Software Engineer`,
    description: site.tagline,
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // data-splash: "on" until the splash leaves; the inline script sets "seen" on repeat visits, so the attribute differs from the server HTML
    <html lang="en" data-splash="on" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: splashScript }} />
        <noscript><style>{`#splash{display:none}`}</style></noscript>
      </head>
      <body className="min-h-full font-sans">
        {children}
      </body>
    </html>
  );
}
