import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  metadataBase: new URL("https://befitliner.com"),
  title: {
    default: "Fitliner – gym access, training and progress in one app",
    template: "%s | Fitliner",
  },
  description:
    "One app for gym access, training, food tracking, community, coaches and rewards. Free to start on iOS and Android.",
  openGraph: {
    title: "Fitliner – gym access, training and progress in one app",
    description:
      "One app for gym access, training, food tracking, community, coaches and rewards. Free to start on iOS and Android.",
    url: "https://befitliner.com",
    siteName: "Fitliner",
    type: "website",
    images: [
      {
        url: "/og/gym-default.png",
        width: 1200,
        height: 630,
        alt: "Fitliner",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fitliner – gym access, training and progress in one app",
    description:
      "One app for gym access, training, food tracking, community, coaches and rewards. Free to start on iOS and Android.",
    images: ["/og/gym-default.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
