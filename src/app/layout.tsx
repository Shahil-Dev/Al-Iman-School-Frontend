import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "cn";
import { Navbar } from "../components/ui/Navbar";
import { ThemeProvider } from "../components/ui/ThemeProvider";
import { LanguageProvider } from "../context/LanguageContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Al-Iman School",
  description: "Management System for Al-Iman School",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        inter.variable,
      )}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <LanguageProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Navbar />
            <main>{children}</main>
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
