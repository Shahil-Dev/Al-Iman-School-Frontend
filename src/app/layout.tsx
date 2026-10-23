import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/src/context/LanguageContext";
import { UserProvider } from "@/src/context/UserContext";
import { ThemeProvider } from "@/src/components/ui/ThemeProvider";
import { Toaster } from "sonner";
import { NavbarMain } from "../components/ui/Navbar";
import Footer from "../components/ui/Footer";
import GlobalLoader from "@/src/components/ui/GlobalLoader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// The favicon is served automatically from src/app/icon.jpg
export const metadata: Metadata = {
  title: "Al-Iman School and Collage",
  description: "Al-Iman School and Collage Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <UserProvider>
            <LanguageProvider>
              <GlobalLoader />
              <NavbarMain />
              {children}
              <Footer />
              <Toaster position="top-right" richColors closeButton />
            </LanguageProvider>
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
