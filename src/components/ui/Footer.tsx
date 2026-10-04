"use client";

import React from "react";
import Link from "next/link";
import {
  FaUniversity,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaFacebookF,
  FaYoutube,
  FaWhatsapp,
  FaArrowRight,
  FaShieldAlt,
} from "react-icons/fa";
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          
          {/* Column 1: School Identity & Mission */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-700/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <FaUniversity className="text-xl" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  {isBn ? "আল-ঈমান স্কুল এন্ড কলেজ" : "AL-IMAN ISLAMIC SCHOOL AND COLLEGE"}
                </h2>
                <p className="text-[11px] text-emerald-400 font-medium">
                  {isBn ? "শিক্ষা • নৈতিকতা • আদর্শ" : "Education • Morality • Ethics"}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {isBn
                ? "সুন্নাহ ভিত্তিক চরিত্র গঠন এবং আধুনিক সমন্বিত দ্বীনি শিক্ষায় নতুন প্রজন্মকে সুনাগরিক হিসেবে গড়ে তোলাই আমাদের প্রধান অঙ্গীকার।"
                : "Empowering the next generation with modern education combined with authentic Islamic values and ethical excellence."}
            </p>

            {/* Social Connect Icons */}
            <div className="flex items-center gap-2 pt-1">
              <a
                href="https://www.facebook.com/share/1J38g4UxLQ/"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-emerald-700 text-slate-300 hover:text-white flex items-center justify-center transition-all border border-slate-700 text-xs"
                title="Facebook"
              >
                <FaFacebookF />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-emerald-700 text-slate-300 hover:text-white flex items-center justify-center transition-all border border-slate-700 text-xs"
                title="YouTube"
              >
                <FaYoutube />
              </a>
              <a
                href="https://wa.me/8801328211952"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-emerald-700 text-slate-300 hover:text-white flex items-center justify-center transition-all border border-slate-700 text-xs"
                title="WhatsApp"
              >
                <FaWhatsapp />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-emerald-800/60 pb-2 inline-block">
              {isBn ? "দ্রুত নেভিগেশন" : "Quick Links"}
            </h3>
            <ul className="space-y-2 text-xs">
              {[
                { label: isBn ? "অনলাইন ভর্তি আবেদন" : "Online Admission", href: "/admission" },
                { label: isBn ? "আমাদের লক্ষ্য ও উদ্দেশ্য" : "About Us", href: "/about" },
                { label: isBn ? "একাডেমিক তথ্য ও ক্লাস" : "Academics", href: "/academics" },
                { label: isBn ? "স্টুডেন্ট / টিচার লগইন" : "Portal Login", href: "/login" },
                { label: isBn ? "অভিভাবক মতামত ও রিভিউ" : "Public Reviews", href: "/reviews" },
              ].map((link, idx) => (
                <li key={idx}>
                  <Link
                    href={link.href}
                    className="hover:text-emerald-400 transition-colors flex items-center gap-2 group"
                  >
                    <FaArrowRight className="text-[9px] text-emerald-500 group-hover:translate-x-1 transition-transform" />
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Portals & Help */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-emerald-800/60 pb-2 inline-block">
              {isBn ? "পোর্টাল ও সেবা" : "Portals & Services"}
            </h3>
            <ul className="space-y-2 text-xs">
              {[
                { label: isBn ? "স্টুডেন্ট ড্যাশবোর্ড" : "Student Dashboard", href: "/Dashboard/studentDashboard" },
                { label: isBn ? "শিক্ষক পোর্টাল" : "Teacher Portal", href: "/Dashboard/TeacherDashboard" },
                { label: isBn ? "অভিভাবক একাউন্টস" : "Parent Portal", href: "/Dashboard/parentDashboard" },
                { label: isBn ? "ভর্তি ট্র্যাকিং" : "Track Application", href: "/admission/track" },
                { label: isBn ? "প্রাইভেসি পলিসি" : "Privacy Policy", href: "/privacy" },
              ].map((link, idx) => (
                <li key={idx}>
                  <Link
                    href={link.href}
                    className="hover:text-emerald-400 transition-colors flex items-center gap-2 group"
                  >
                    <FaShieldAlt className="text-[9px] text-emerald-500 shrink-0" />
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-emerald-800/60 pb-2 inline-block">
              {isBn ? "যোগাযোগের ঠিকানা" : "Official Contact"}
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                  <FaMapMarkerAlt />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                    {isBn ? "ঠিকানা" : "Address"}
                  </span>
                  <p className="text-slate-200 font-medium">
                    {isBn ? "চট্টগ্রাম, বাংলাদেশ" : "Chittagong, Bangladesh"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                  <FaPhoneAlt />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                    {isBn ? "হোয়াটসঅ্যাপ ও ফোন" : "WhatsApp & Phone"}
                  </span>
                  <a
                    href="tel:+8801328211952"
                    className="text-slate-200 font-mono font-bold hover:text-emerald-400 transition-colors"
                  >
                    +880 1328211952
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                  <FaEnvelope />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                    {isBn ? "ইমেইল এড্রেস" : "Email Address"}
                  </span>
                  <a
                    href="mailto:alimanschool2009@outlook.com"
                    className="text-slate-200 font-mono hover:text-emerald-400 transition-colors truncate block"
                  >
                    alimanschool2009@outlook.com
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Copyright Strip */}
        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-3">
          <p>
            © {new Date().getFullYear()}{" "}
            <span className="text-emerald-400 font-bold">
              Al-Iman Islamic School
            </span>
            . {isBn ? "সর্বস্বত্ব সংরক্ষিত।" : "All rights reserved."}
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>
              {isBn ? "স্থাপিত: ২০০৯ ইং" : "Established: 2009"}
            </span>
            <span>•</span>
            <span>
              {isBn ? "আল-ঈমান ইআরপি সিস্টেম" : "Al-Iman ERP Management"}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}