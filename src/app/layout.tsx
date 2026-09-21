import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/src/context/LanguageContext";
import { UserProvider } from "@/src/context/UserContext";
import { ThemeProvider } from "@/src/components/ui/ThemeProvider";
import { Toaster } from "sonner"; // <--- Sonner Toaster ইম্পোর্ট
import { NavbarMain } from "../components/ui/Navbar";

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
  description: "Al-Iman School Management System",
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
              <NavbarMain></NavbarMain>
              {children }
              <Toaster position="top-right" richColors closeButton />
            </LanguageProvider>
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}