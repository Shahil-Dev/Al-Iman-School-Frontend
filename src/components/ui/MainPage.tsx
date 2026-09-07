import React from "react";
import Link from "next/link";

import { 
 
  FaChalkboardTeacher, 
  FaBullhorn, 
  FaLaptopCode, 
  FaFileDownload,
  FaArrowRight, 
  FaGraduationCap
} from "react-icons/fa";
import { Button } from "@base-ui/react";
import { Card, CardContent } from "./card";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
  

      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-indigo-50/50 via-white to-slate-50 py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
              <FaLaptopCode className="text-sm" /> Modern Educational Management
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Empowering Education with <span className="text-indigo-600">Smart ERP Solution</span>
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed">
              Welcome to Al-Iman School Management System. Seamlessly integrating Academic, Examination, Fees, and Student Tracking in one unified web portal.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link href="/admission">
                <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-8 shadow-md shadow-indigo-100 flex items-center gap-2">
                  Apply for Admission <FaArrowRight />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="border-slate-300 text-slate-700 rounded-xl px-8 hover:bg-slate-100">
                  Student/Parent Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="flex items-center gap-5 p-2">
            <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-600">
              <FaGraduationCap className="text-3xl" />
            </div>
            <div>
              <h3 className="text-3xl font-extrabold text-slate-900">1,200+</h3>
              <p className="text-sm font-medium text-slate-500">Active Students</p>
            </div>
          </div>

          <div className="flex items-center gap-5 p-2 border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0 sm:pl-6">
            <div className="p-4 bg-emerald-50 rounded-2xl text-emerald-600">
              <FaChalkboardTeacher className="text-3xl" />
            </div>
            <div>
              <h3 className="text-3xl font-extrabold text-slate-900">55+</h3>
              <p className="text-sm font-medium text-slate-500">Expert Teachers</p>
            </div>
          </div>

          <div className="flex items-center gap-5 p-2 border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0 sm:pl-6">
            <div className="p-4 bg-amber-50 rounded-2xl text-amber-600">
              <FaBullhorn className="text-3xl" />
            </div>
            <div>
              <h3 className="text-3xl font-extrabold text-slate-900">100%</h3>
              <p className="text-sm font-medium text-slate-500">Digital Automated ERP</p>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Notice Board Section */}
      <section id="notices" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Notice Board & Announcements</h2>
            <p className="text-slate-500 mt-1">Stay updated with the latest academic news and exam notices.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Sample Dynamic Notice Card 1 */}
          <Card className="border-slate-200 hover:shadow-md transition-shadow">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full w-fit">
                Academic
              </div>
              <h3 className="text-lg font-bold text-slate-800 line-clamp-2">
                Annual Examination Schedule & Exam Guidelines 2026
              </h3>
              <p className="text-sm text-slate-500 line-clamp-2">
                The final examinations for classes 6 to 10 will commence from November 15th. Check syllabus details inside.
              </p>
              <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-100">
                <span>Date: Oct 28, 2026</span>
                <button className="text-indigo-600 font-semibold flex items-center gap-1 hover:underline">
                  <FaFileDownload /> PDF
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Sample Notice Card 2 */}
          <Card className="border-slate-200 hover:shadow-md transition-shadow">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full w-fit">
                Admission
              </div>
              <h3 className="text-lg font-bold text-slate-800 line-clamp-2">
                Online Admission Open for Session 2027
              </h3>
              <p className="text-sm text-slate-500 line-clamp-2">
                Applications are now invited for Class 6 to Class 9. Apply online through our official portal.
              </p>
              <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-100">
                <span>Date: Oct 25, 2026</span>
                <button className="text-indigo-600 font-semibold flex items-center gap-1 hover:underline">
                  <FaFileDownload /> PDF
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Sample Notice Card 3 */}
          <Card className="border-slate-200 hover:shadow-md transition-shadow">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between text-xs font-semibold text-amber-600 bg-amber-50 px-3 py-1 rounded-full w-fit">
                Holiday
              </div>
              <h3 className="text-lg font-bold text-slate-800 line-clamp-2">
                Notice regarding Eid-ul-Fitr Vacation
              </h3>
              <p className="text-sm text-slate-500 line-clamp-2">
                The school campus will remain closed from March 20th to March 30th on account of holy Eid holidays.
              </p>
              <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-100">
                <span>Date: Oct 18, 2026</span>
                <button className="text-indigo-600 font-semibold flex items-center gap-1 hover:underline">
                  <FaFileDownload /> PDF
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-400 py-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm">
          <p>© {new Date().getFullYear()} Al-Iman School. All Rights Reserved. Powered by Al-Iman ERP System.</p>
        </div>
      </footer>
    </div>
  );
}