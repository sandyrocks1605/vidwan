import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
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
  metadataBase: new URL(
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000"
  ),
  title: "Vidwan — MUN • Debate • Leadership",
  description:
    "A platform helping students build the skills, confidence and perspective to become future leaders.",
  icons: {
    icon: "/images/vidwan-logo.png",
    apple: "/images/vidwan-logo.png",
  },
  openGraph: {
    title: "Vidwan — MUN • Debate • Leadership",
    description:
      "A platform helping students build the skills, confidence and perspective to become future leaders.",
    type: "website",
    images: ["/images/vidwan-experience.png"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  );
}