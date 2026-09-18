import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/src/context/LanguageContext"; // আপনার প্রজেক্টের সঠিক পাথ অনুযায়ী যাচাই করুন
import Navbar from "./Dashboard/components/Navbar";
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LanguageProvider>
        <NavbarMain/>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}