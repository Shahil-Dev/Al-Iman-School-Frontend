"use client";

import React, { useEffect, useState } from "react";
import { FaBullhorn, FaCalendarAlt, FaSearch, FaFileAlt, FaSpinner, FaUpload, FaTimes, FaPlus, FaCheck } from "react-icons/fa";
import { Card, CardContent } from "@/src/components/ui/card";
import axiosInstance from "@/src/lib/axiosInstance";
import { useLanguage } from "@/src/context/LanguageContext";

export default function NoticeBoardPage() {
  const { language } = useLanguage();
  const isBn = language === "bn";

  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNotice, setSelectedNotice] = useState<any | null>(null);

  // New Notice Modal & Form States (For Admin / Notice Creator)
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("General");
  const [imageUrl, setImageUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchNotices = () => {
    setLoading(true);
    axiosInstance
      .get("/notices")
      .then((res) => {
        const loaded = res.data?.data || res.data || [];
        setNotices(Array.isArray(loaded) ? loaded : []);
      })
      .catch((err) => console.error("Failed to load notices", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  // Handle Direct Folder File Upload & Auto Compression for Notices
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg(isBn ? "ছবির সাইজ 5MB এর কম হতে হবে।" : "Image size must be less than 5MB.");
      return;
    }

    setFileName(file.name);
    setErrorMsg("");

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        // Compressed lightweight base64 string to prevent payload size errors
        const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.7);
        setImageUrl(compressedDataUrl);
        setPreviewUrl(compressedDataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setErrorMsg(isBn ? "শিরোনাম এবং বিবরণ আবশ্যক।" : "Title and description are required.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg("");

      await axiosInstance.post("/notices", {
        title: title.trim(),
        description: description.trim(),
        category,
        imageUrl: imageUrl || undefined,
      });

      setShowCreateModal(false);
      setTitle("");
      setDescription("");
      setImageUrl("");
      setPreviewUrl("");
      setFileName("");
      fetchNotices();
    } catch (err: any) {
      setErrorMsg(
        err?.response?.data?.message ||
          (isBn ? "নোটিশ প্রকাশ করতে সমস্যা হয়েছে।" : "Failed to publish notice.")
      );
    } finally {
      setSubmitting(false);
    }
  };

  const filteredNotices = notices.filter(
    (n) =>
      n.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-8 rounded-3xl shadow-lg relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="relative z-10 space-y-2">
            <span className="bg-emerald-500/20 text-emerald-300 text-xs px-3 py-1 rounded-full font-semibold uppercase tracking-wider">
              {isBn ? "অফিসিয়াল নোটিশ" : "Official Announcements"}
            </span>
            <h1 className="text-2xl md:text-4xl font-extrabold flex items-center gap-3">
              <FaBullhorn className="text-amber-400 animate-pulse" />
              <span>{isBn ? "স্কুল নোটিশ বোর্ড" : "Notice Board"}</span>
            </h1>
            <p className="text-xs md:text-sm text-emerald-100/90 max-w-2xl">
              {isBn
                ? "আল-ঈমান স্কুলের যাবতীয় একাডেমিক খবর, পরীক্ষার সময়সূচি এবং জরুরি ঘোষণা।"
                : "Latest academic notices, exam schedules, and official news from Al-Iman School."}
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow transition shrink-0"
          >
            <FaPlus />
            <span>{isBn ? "নতুন নোটিশ পোস্ট করুন" : "Post New Notice"}</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="flex justify-between items-center bg-card p-4 rounded-2xl border border-border shadow-sm">
          <div className="relative w-full max-w-md">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs" />
            <input
              type="text"
              placeholder={isBn ? "নোটিশ খুঁজুন..." : "Search notices..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <span className="text-xs font-semibold text-muted-foreground hidden sm:inline">
            {isBn ? `মোট নোটিশ: ${filteredNotices.length}` : `Total Notices: ${filteredNotices.length}`}
          </span>
        </div>

        {/* Notices Content */}
        {loading ? (
          <div className="p-12 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
            <FaSpinner className="animate-spin text-emerald-600 text-lg" />
            <span>{isBn ? "নোটিশ লোড হচ্ছে..." : "Loading notices..."}</span>
          </div>
        ) : filteredNotices.length === 0 ? (
          <Card className="border-border shadow-sm rounded-2xl p-8 text-center text-muted-foreground text-xs">
            {isBn ? "কোনো নোটিশ পাওয়া যায়নি।" : "No notices found."}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotices.map((item) => (
              <Card
                key={item.id}
                className="border-border/60 hover:border-primary/50 shadow-sm hover:shadow-md transition-all rounded-2xl bg-card overflow-hidden flex flex-col justify-between"
              >
                <CardContent className="p-6 space-y-4">
                  {item.imageUrl && (
                    <div className="h-36 w-full overflow-hidden rounded-xl bg-muted">
                      <img src={item.imageUrl} alt="Notice banner" className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2 border-b border-border/50 pb-3">
                    <span className="text-[11px] font-mono text-emerald-600 font-semibold flex items-center gap-1.5">
                      <FaCalendarAlt />
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString(isBn ? "bn-BD" : "en-US") : "N/A"}
                    </span>
                    <span className="bg-primary/10 text-primary text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                      {item.category || (isBn ? "সাধারণ" : "General")}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-foreground line-clamp-2 leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                    {item.description || item.content}
                  </p>

                  <button
                    onClick={() => setSelectedNotice(item)}
                    className="w-full py-2 bg-muted/60 hover:bg-primary hover:text-primary-foreground text-foreground text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <FaFileAlt />
                    <span>{isBn ? "বিস্তারিত বিবরণ" : "Read Full Notice"}</span>
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Notice Details Modal */}
        {selectedNotice && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start border-b pb-3">
                <h2 className="text-base font-bold text-foreground pr-4">{selectedNotice.title}</h2>
                <button
                  onClick={() => setSelectedNotice(null)}
                  className="text-muted-foreground hover:text-foreground text-lg font-bold"
                >
                  <FaTimes />
                </button>
              </div>

              {selectedNotice.imageUrl && (
                <div className="rounded-xl overflow-hidden bg-muted max-h-56">
                  <img src={selectedNotice.imageUrl} alt="Notice attachment" className="w-full object-contain" />
                </div>
              )}

              <div className="text-xs font-mono text-emerald-600 flex items-center gap-1.5">
                <FaCalendarAlt />
                {new Date(selectedNotice.createdAt).toLocaleDateString(isBn ? "bn-BD" : "en-US")}
              </div>
              <div className="text-xs text-foreground/90 space-y-2 whitespace-pre-line">
                {selectedNotice.description || selectedNotice.content}
              </div>
              <div className="pt-2 text-right">
                <button
                  onClick={() => setSelectedNotice(null)}
                  className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-xl"
                >
                  {isBn ? "বন্ধ করুন" : "Close"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Notice Modal with Direct Folder Upload */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-card border border-border rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl my-auto">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <FaBullhorn className="text-primary" />
                  <span>{isBn ? "নতুন নোটিশ তৈরি করুন" : "Create Notice"}</span>
                </h3>
                <button onClick={() => setShowCreateModal(false)} className="text-muted-foreground hover:text-foreground">
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleCreateNotice} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold block mb-1 text-foreground">
                    {isBn ? "নোটিশের শিরোনাম: *" : "Notice Title: *"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isBn ? "যেমন: বার্ষিক পরীক্ষার রুটিন..." : "e.g. Annual Exam Routine..."}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-background border border-input rounded-xl p-2 text-foreground focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1 text-foreground">
                    {isBn ? "ক্যাটাগরি:" : "Category:"}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-background border border-input rounded-xl p-2 font-semibold text-foreground focus:ring-2 focus:ring-primary outline-none"
                  >
                    <option value="General">{isBn ? "সাধারণ (General)" : "General"}</option>
                    <option value="Exam">{isBn ? "পরীক্ষা (Exam)" : "Exam"}</option>
                    <option value="Holiday">{isBn ? "ছুটি (Holiday)" : "Holiday"}</option>
                    <option value="Event">{isBn ? "ইভেন্ট (Event)" : "Event"}</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold block mb-1 text-foreground">
                    {isBn ? "বিস্তারিত বিবরণ: *" : "Description: *"}
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder={isBn ? "নোটিশের মূল বিষয়বস্তু এখানে লিখুন..." : "Write notice content here..."}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-background border border-input rounded-xl p-2 text-foreground focus:ring-2 focus:ring-primary outline-none resize-none"
                  />
                </div>

                {/* Direct Folder Image Upload for Notice */}
                <div>
                  <label className="font-bold block mb-1 text-foreground">
                    {isBn ? "নোটিশ ব্যানার / ছবি (ফোল্ডার থেকে):" : "Notice Image / Banner (From Folder):"}
                  </label>
                  <div className="border-2 border-dashed border-input hover:border-primary rounded-xl p-3 text-center cursor-pointer relative bg-background/50 transition">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    {previewUrl ? (
                      <div className="flex items-center justify-between p-1">
                        <div className="flex items-center gap-2">
                          <img src={previewUrl} alt="Preview" className="h-9 w-9 object-cover rounded-md border" />
                          <span className="text-[10px] text-emerald-600 font-bold truncate max-w-[160px]">
                            {fileName || (isBn ? "ছবি যুক্ত হয়েছে" : "Attached")}
                          </span>
                        </div>
                        <span className="text-[9px] bg-emerald-500/10 text-emerald-600 font-bold px-2 py-0.5 rounded-full border border-emerald-500/20">
                          <FaCheck className="inline mr-1" /> Ready
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2 text-muted-foreground py-1">
                        <FaUpload className="text-primary" />
                        <span className="text-[11px] font-semibold text-foreground">
                          {isBn ? "ফোল্ডার থেকে ছবি সিলেক্ট করুন" : "Select Image from Folder"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-2 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl text-[10px]">
                    {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-2 rounded-xl font-bold transition flex items-center justify-center gap-2 mt-2"
                >
                  {submitting ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      <span>{isBn ? "প্রকাশ করা হচ্ছে..." : "Publishing..."}</span>
                    </>
                  ) : (
                    <span>{isBn ? "নোটিশ প্রকাশ করুন" : "Publish Notice"}</span>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}