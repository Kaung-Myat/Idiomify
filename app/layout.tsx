import type { Metadata, Viewport } from "next";
import { Noto_Sans_Myanmar, Roboto } from "next/font/google";
import { AppShell } from "@/components/layout/AppShell";
import { LocaleHtml } from "@/components/layout/LocaleHtml";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AuthProvider } from "@/lib/auth/useAuth";
import "./globals.css";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-body",
});

const myanmar = Noto_Sans_Myanmar({
  subsets: ["myanmar"],
  variable: "--font-myanmar",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  applicationName: "Idiomify",
  title: {
    default: "Idiomify — Pronunciation, Idioms & Vocabulary",
    template: "%s · Idiomify",
  },
  description:
    "Master pronunciation, idioms, and vocabulary through gamified AI learning.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Idiomify",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#e8f3f1" },
    { media: "(prefers-color-scheme: dark)", color: "#071b1f" },
  ],
};

const themeInitScript = `
(function () {
  try {
    var t = localStorage.getItem('idiomify-theme');
    if (t !== 'light' && t !== 'dark') t = 'dark';
    document.documentElement.dataset.theme = t;
  } catch (e) {
    document.documentElement.dataset.theme = 'dark';
  }
  try {
    var s = parseFloat(localStorage.getItem('idiomify-text-scale') || '1');
    if (!isFinite(s)) s = 1;
    s = Math.min(1.3, Math.max(0.85, Math.round(s / 0.05) * 0.05));
    document.documentElement.style.setProperty('--text-scale', String(s));
    document.documentElement.style.fontSize = (s * 100) + '%';
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="my" suppressHydrationWarning data-theme="dark">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body
        className={`${roboto.variable} ${myanmar.variable} antialiased`}
      >
        <ThemeProvider>
          <AuthProvider>
            <LocaleHtml />
            <AppShell>{children}</AppShell>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
