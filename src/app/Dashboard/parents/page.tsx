"use client";

import React, { useEffect, useState } from "react";
import { FaUserFriends, FaSearch, FaWhatsapp } from "react-icons/fa";
import { Card, CardContent } from "@/src/components/ui/card";
import axiosInstance from "@/src/lib/axiosInstance";
import { useLanguage } from "@/src/context/LanguageContext";

export default function ParentsDatabasePage() {
  const { language } = useLanguage();
  const isBn = language === "bn";

  const [parents, setParents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance
      .get("/students")
      .then((res) => setParents(res.data?.data || []))
      .catch((err) => console.error("Failed to load parent records", err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = parents.filter(
    (p) =>
      p.fatherName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone?.includes(searchTerm) ||
      p.firstName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <FaUserFriends className="text-primary" />
            <span>{isBn ? "অভিভাবক ডাটাবেজ" : "Parent Directory & Database"}</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {isBn ? "অভিভাবকদের মোবাইল নম্বর ও যোগাযোগের তথ্যাবলী।" : "Search and manage parent contacts and WhatsApp details."}
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <FaSearch className="absolute left-3 top-2.5 text-xs text-muted-foreground" />
          <input
            type="text"
            placeholder={isBn ? "অভিভাবক বা ছাত্রের নাম/ফোন..." : "Search parent or student..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-card border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
          />
        </div>
      </div>

      <Card className="border-border/60 shadow-sm rounded-2xl bg-card">
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border/60 text-muted-foreground uppercase text-[10px]">
                  <th className="py-3 px-3">Student Name</th>
                  <th className="py-3 px-3">Class</th>
                  <th className="py-3 px-3">Father's Name</th>
                  <th className="py-3 px-3">Mother's Name</th>
                  <th className="py-3 px-3">WhatsApp Number</th>
                  <th className="py-3 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30">
                    <td className="py-3 px-3 font-semibold text-foreground">
                      {item.firstName} {item.lastName} ({item.studentIdNo})
                    </td>
                    <td className="py-3 px-3">{item.class?.name || "N/A"}</td>
                    <td className="py-3 px-3">{item.fatherName || "N/A"}</td>
                    <td className="py-3 px-3">{item.motherName || "N/A"}</td>
                    <td className="py-3 px-3 font-mono text-primary">{item.phone || "N/A"}</td>
                    <td className="py-3 px-3 text-center">
                      {item.phone && (
                        <a
                          href={`https://wa.me/88${item.phone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 text-white text-[10px] font-semibold rounded-lg hover:bg-emerald-700 transition-all"
                        >
                          <FaWhatsapp />
                          <span>Chat</span>
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}