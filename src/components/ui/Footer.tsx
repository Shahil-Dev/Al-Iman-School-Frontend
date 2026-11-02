"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/src/context/LanguageContext";

export default function Footer() {
  const { language } = useLanguage();
  const isBn = language === "bn";

  return (
    <footer className="bg-slate-900 text-slate-300 relative overflow-hidden border-t border-emerald-900/40 font-sans">
      {/* Background Watermark Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02] flex items-center justify-center font-serif text-8xl md:text-9xl text-white select-none">
        بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Column 1: School Identity & Mission */}
          <div className="space-y-4 lg:col-span-2">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {isBn ? "আল-ঈমান স্কুল এন্ড কলেজ" : "AL-IMAN SCHOOL AND COLLEGE"}
              </h2>
              <p className="text-xs text-emerald-400 font-medium mt-1">
                {isBn ? "শিক্ষা • নৈতিকতা • আদর্শ" : "Education • Morality • Ethics"}
              </p>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed max-w-md">
              {isBn
                ? "সুন্নাহ ভিত্তিক চরিত্র গঠন এবং আধুনিক সমন্বিত দ্বীনি শিক্ষায় নতুন প্রজন্মকে সুনাগরিক হিসেবে গড়ে তোলাই আমাদের প্রধান অঙ্গীকার।"
                : "Empowering the next generation with modern education combined with authentic Islamic values and ethical excellence."}
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white tracking-wider">
              {isBn ? "দ্রুত নেভিগেশন" : "Quick Navigation"}
            </h3>
            <ul className="space-y-2.5 text-sm">
              {[
                { label: isBn ? "হোম" : "Home", href: "/" },
                { label: isBn ? "আমাদের সম্পর্কে" : "About Us", href: "/about" },
                { label: isBn ? "নোটিশ বোর্ড" : "Notice Board", href: "/notices" },
                { label: isBn ? "শিক্ষক মণ্ডলী" : "Teachers", href: "/teachers" },
                { label: isBn ? "অনলাইন ভর্তি" : "Online Admission", href: "/admission" },
              ].map((link, idx) => (
                <li key={idx}>
                  <Link
                    href={link.href}
                    className="text-slate-400 hover:text-emerald-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Portals & Services (Dummy Text) */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white tracking-wider">
              {isBn ? "পোর্টাল ও সেবা" : "Portals & Services"}
            </h3>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>{isBn ? "স্টুডেন্ট ড্যাশবোর্ড" : "Student Dashboard"}</li>
              <li>{isBn ? "শিক্ষক পোর্টাল" : "Teacher Portal"}</li>
              <li>{isBn ? "অভিভাবক একাউন্টস" : "Parent Portal"}</li>
              <li>{isBn ? "ভর্তি ট্র্যাকিং" : "Track Application"}</li>
              <li>{isBn ? "প্রাইভেসি পলিসি" : "Privacy Policy"}</li>
            </ul>
          </div>
        </div>

               {/* Bottom Copyright & Developer Credit */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>
            © {new Date().getFullYear()}{" "}
            <span className="text-emerald-400 font-medium">
              Al-Iman School and College
            </span>
            . {isBn ? "সর্বস্বত্ব সংরক্ষিত।" : "All rights reserved."}
          </p>

          <div className="flex items-center gap-1.5">
            <span>{isBn ? "ডিজাইন ও ডেভেলপমেন্ট:" : "Designed & Developed by"}</span>
            <a
              href="https://my-portfolio-ecru-kappa-54.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="relative text-slate-200 font-semibold tracking-wide group transition-colors hover:text-emerald-400"
            >
              {/* এখানে আপনার নাম দিন */}
              Yemtehan Shahil
              
              {/* Hover Effect Underline */}
              <span className="absolute -bottom-0.5 left-0 w-0 h-[1px] bg-emerald-400 transition-all duration-300 group-hover:w-full"></span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}