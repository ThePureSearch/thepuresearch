import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Pure Search — Find anything on Amazon",
  description: "Describe what you are looking for and find the best Amazon products instantly. Simple, fast, available worldwide.",
  keywords: "amazon, search, products, shopping, find products, amazon search engine",
  openGraph: {
    title: "The Pure Search",
    description: "The simplest way to find products on Amazon.",
    url: "https://www.thepuresearch.com",
    siteName: "The Pure Search",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "The Pure Search",
    description: "Find the best Amazon products by describing what you need.",
  },
  icons: {
    icon: "/favicon.ico",
  },
  alternates: {
    canonical: "https://www.thepuresearch.com",
    languages: {
      "en": "https://www.thepuresearch.com",
      "fr": "https://www.thepuresearch.com",
      "de": "https://www.thepuresearch.com",
      "es": "https://www.thepuresearch.com",
      "it": "https://www.thepuresearch.com",
      "pt": "https://www.thepuresearch.com",
      "ja": "https://www.thepuresearch.com",
      "nl": "https://www.thepuresearch.com",
      "pl": "https://www.thepuresearch.com",
      "sv": "https://www.thepuresearch.com",
      "tr": "https://www.thepuresearch.com",
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
