import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/src/context/LanguageContext";
import { NavbarMain } from "../components/ui/Navbar";
import { UserProvider } from "../context/UserContext";
// import { UserProvider } from "@/src/context/UserContext"; // <--- UserProvider ইম্পোর্ট করুন

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
      <UserProvider>
      <LanguageProvider>
        {children}
      </LanguageProvider>
    </UserProvider>
      </body>
    </html>
  );
}