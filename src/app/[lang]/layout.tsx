import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import "@/app/globals.css";
import {
  dictType,
  getDictionary,
  langType,
  rtlLanguages,
} from "@/dictionaries";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata({
  params,
}: Readonly<{
  params: Promise<langType>;
}>): Promise<Metadata> {
  const { lang } = await params;
  const dict: dictType = await getDictionary(lang);

  return {
    title: dict.seo.title,
    description: dict.seo.description,
    keywords: dict.seo.keywords,
    authors: [{ name: dict.seo.codinasion, url: "https://www.codinasion.com" }],
    creator: dict.seo.codinasion,
    publisher: dict.seo.codinasion,
    metadataBase: new URL("https://bg-remover.codinasion.com"),
    openGraph: {
      type: "website",
      locale: "en_US",
      title: dict.seo.og_title,
      description: dict.seo.og_description,
      images: ["/demo.png"],
    },
    twitter: {
      card: "summary_large_image",
      title: dict.seo.og_title,
      description: dict.seo.og_description,
      images: ["/demo.png"],
      creator: "@codinasion",
      siteId: "1527970903367135232",
      creatorId: "1527970903367135232",
    },
  };
}

export default async function RootLayout({
  params,
  children,
}: Readonly<{
  params: Promise<langType>;
  children: React.ReactNode;
}>) {
  const { lang } = await params;

  const dir = rtlLanguages.includes(lang) ? "rtl" : "ltr";

  return (
    <html lang={lang} dir={dir} suppressHydrationWarning>
      <head>
        <link
          rel="icon"
          type="image/png"
          href="/favicon-96x96.png"
          sizes="96x96"
        />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <meta name="apple-mobile-web-app-title" content="BG Remover" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
      <GoogleAnalytics gaId="G-S88JXFVVB4" />
      {/* eslint-disable-next-line @next/next/no-sync-scripts */}
      <script
        data-name="BMC-Widget"
        data-cfasync="false"
        src="https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js"
        data-id="codinasion"
        data-description="Support me on Buy me a coffee!"
        data-message=""
        data-color="#FFDD00"
        data-position="Right"
        data-x_margin="18"
        data-y_margin="18"
      ></script>
    </html>
  );
}
