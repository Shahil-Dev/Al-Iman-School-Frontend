"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  FaUserGraduate,
  FaSearch,
  FaFilter,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaEye,
  FaSpinner,
  FaTimes,
  FaUserCheck,
  FaUserTimes,
  FaMoneyCheckAlt,
} from "react-icons/fa";
import { useLanguage } from "@/src/context/LanguageContext";
import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { admissionApi } from "@/src/Services/admissionApi";
import { academicService } from "@/src/Services/academicService";
import { toast } from "sonner";

export default function AdmissionsManagementPage() {
  const { language } = useLanguage();
  const [admissions, setAdmissions] = useState<any[]>([]);
  const [classesList, setClassesList] = useState<any[]>([]);
  const [sectionsList, setSectionsList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Active Tab Filter (PENDING, APPROVED, REJECTED)
  const [activeTab, setActiveTab] = useState<"PENDING" | "APPROVED" | "REJECTED">("PENDING");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("ALL");

  // Modal State
  const [selectedAdmission, setSelectedAdmission] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);

  // Approval Form State
  const [approvalData, setApprovalData] = useState({
    sectionId: "",
    rollNo: 1,
  });

  // Load Classes List
  useEffect(() => {
    async function loadClasses() {
      try {
        const res = await academicService.getAllClasses();
        setClassesList(res?.data || res || []);
      } catch (err) {
        console.error("Failed to load classes:", err);
      }
    }
    loadClasses();
  }, []);

  // Fetch Admissions strictly by Active Tab Status
  const fetchAdmissions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await admissionApi.getAllAdmissions({
        status: activeTab,
        classId: selectedClassId !== "ALL" ? selectedClassId : undefined,
        searchTerm: searchTerm || undefined,
      });
      setAdmissions(res.data || []);
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to fetch admission applications";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [activeTab, selectedClassId, searchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAdmissions();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchAdmissions]);

  // Handle Review Modal
  const handleOpenDetails = async (item: any) => {
    setSelectedAdmission(item);
    setShowRejectInput(false);
    setRejectReason("");
    setIsModalOpen(true);
    try {
      const sectionsRes = await academicService.getAllSections(item.classId);
      const sections = sectionsRes?.data || sectionsRes || [];
      setSectionsList(sections);
      if (sections.length > 0) {
        setApprovalData((prev) => ({ ...prev, sectionId: sections[0].id }));
      }
    } catch (err) {
      console.error("Failed to load sections for class:", err);
    }
  };

  // Handle Approve Action
  const handleApprove = async () => {
    if (!selectedAdmission) return;

    setActionLoading(true);
    const toastId = toast.loading("Approving admission & creating student profile...");

    try {
      await admissionApi.approveAdmission(selectedAdmission.id, {
        sectionId: approvalData.sectionId || undefined,
        rollNo: Number(approvalData.rollNo) || undefined,
      });

      toast.success("Admission Approved! Student Account Created.", { id: toastId });
      setIsModalOpen(false);
      fetchAdmissions(); // Refresh List
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to approve admission", { id: toastId });
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Reject Action
  const handleReject = async () => {
    if (!selectedAdmission) return;
    if (!rejectReason.trim()) {
      toast.error("Please enter a reason for rejection!");
      return;
    }

    setActionLoading(true);
    const toastId = toast.loading("Rejecting application...");

    try {
      await admissionApi.rejectAdmission(selectedAdmission.id, rejectReason);

      toast.success("Admission Application Rejected Successfully.", { id: toastId });
      setIsModalOpen(false);
      fetchAdmissions(); // Refresh List
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to reject application", { id: toastId });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-foreground flex items-center gap-2.5">
          <FaUserGraduate className="text-primary text-2xl" />
          <span>{language === "bn" ? "ভর্তি আবেদন ব্যবস্থাপনা" : "Admissions Management"}</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          {language === "bn"
            ? "অনলাইন ভর্তি আবেদন পর্যালোচনা, অনুমোদন ও রিজেক্ট করুন"
            : "Review applications, approve student accounts, or reject applications"}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        {(["PENDING", "APPROVED", "REJECTED"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
              activeTab === tab
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {tab === "PENDING" && <FaClock className="inline mr-1.5" />}
            {tab === "APPROVED" && <FaCheckCircle className="inline mr-1.5" />}
            {tab === "REJECTED" && <FaTimesCircle className="inline mr-1.5" />}
            <span>{tab}</span>
          </button>
        ))}
      </div>

      {/* Search & Class Filter */}
      <Card className="border-border/60 shadow-sm rounded-2xl bg-card">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs" />
            <input
              type="text"
              placeholder="Search by student, guardian or TrxID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 text-xs rounded-xl border border-input bg-background w-full focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <FaFilter className="text-muted-foreground text-xs shrink-0" />
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="px-3.5 py-2 text-xs rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-48 font-semibold cursor-pointer"
            >
              <option value="ALL">All Classes</option>
              {classesList.map((cls: any) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Applications Data Table */}
      <Card className="border-border/60 shadow-sm rounded-2xl bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-muted/50 text-muted-foreground border-b border-border font-semibold">
                <th className="p-4">App No / TrxID</th>
                <th className="p-4">Student Name</th>
                <th className="p-4">Class</th>
                <th className="p-4">Payment Info</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 text-foreground font-medium">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center p-8">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <FaSpinner className="animate-spin text-lg text-primary" />
                      <span>Loading applications...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="text-center p-8 text-destructive font-semibold">
                    {error}
                  </td>
                </tr>
              ) : admissions.length > 0 ? (
                admissions.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <span className="font-bold text-foreground">{item.applicationNo}</span>
                      <span className="block text-[10px] text-primary font-mono">{item.transactionId}</span>
                    </td>
                    <td className="p-4 font-semibold text-foreground">{item.studentName}</td>
                    <td className="p-4">{item.class?.name || "N/A"}</td>
                    <td className="p-4">
                      <span className="font-semibold text-emerald-600">৳ {item.amount}</span>
                      <span className="block text-[10px] text-muted-foreground">
                        {item.paymentMethod} ({item.senderPhone})
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Button
                        onClick={() => handleOpenDetails(item)}
                        variant="outline"
                        className="px-3 py-1.5 h-auto text-[11px] rounded-xl flex items-center gap-1.5 inline-flex"
                      >
                        <FaEye className="text-primary text-xs" />
                        <span>Review</span>
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center p-8 text-muted-foreground font-medium">
                    No {activeTab.toLowerCase()} applications found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Review Application Modal */}
      {isModalOpen && selectedAdmission && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <Card className="max-w-lg w-full bg-card border-border shadow-2xl rounded-2xl overflow-hidden my-8">
            <div className="p-5 border-b border-border flex items-center justify-between bg-muted/30">
              <h3 className="text-sm font-bold text-foreground">Review Admission Application</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {/* Applicant Info Header */}
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-foreground">{selectedAdmission.studentName}</h4>
                  <span className="text-[10px] font-mono bg-primary/20 text-primary px-2 py-0.5 rounded-md">
                    {selectedAdmission.applicationNo}
                  </span>
                </div>
                <p className="text-muted-foreground">
                  Applied Class: <span className="font-semibold text-foreground">{selectedAdmission.class?.name}</span> | Gender: {selectedAdmission.gender}
                </p>
                <p className="text-muted-foreground">Email: {selectedAdmission.email} | Phone: {selectedAdmission.phone}</p>
              </div>

              {/* Payment Verification Card */}
              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                <div className="flex items-center gap-2 text-emerald-600 font-bold">
                  <FaMoneyCheckAlt />
                  <span>Payment Information</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[11px]">
                  <div>
                    <span className="text-muted-foreground block text-[9px]">Amount Paid</span>
                    <span className="font-bold text-foreground">৳ {selectedAdmission.amount}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[9px]">Method / Sender</span>
                    <span className="font-bold text-foreground">{selectedAdmission.paymentMethod} ({selectedAdmission.senderPhone})</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[9px]">Transaction ID</span>
                    <span className="font-mono font-bold text-primary">{selectedAdmission.transactionId}</span>
                  </div>
                </div>
              </div>

              {/* Guardian Info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-muted/40 border border-border/50">
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold">Guardian Info</p>
                  <p className="font-semibold text-foreground">{selectedAdmission.guardianName} ({selectedAdmission.guardianPhone})</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/40 border border-border/50">
                  <p className="text-[10px] text-muted-foreground uppercase font-semibold">Address</p>
                  <p className="font-semibold text-foreground">{selectedAdmission.address}</p>
                </div>
              </div>

              {/* Section & Roll Form (Only for PENDING) */}
              {selectedAdmission.status === "PENDING" && !showRejectInput && (
                <div className="p-4 rounded-xl bg-card border border-border/80 space-y-3">
                  <h4 className="font-bold text-foreground">Assign Section & Roll (Optional)</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase font-semibold mb-1 text-muted-foreground">
                        Section
                      </label>
                      <select
                        value={approvalData.sectionId}
                        onChange={(e) => setApprovalData({ ...approvalData, sectionId: e.target.value })}
                        className="w-full p-2 rounded-xl border border-input bg-background text-foreground"
                      >
                        {sectionsList.map((sec) => (
                          <option key={sec.id} value={sec.id}>
                            Section {sec.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-semibold mb-1 text-muted-foreground">
                        Roll Number
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={approvalData.rollNo}
                        onChange={(e) => setApprovalData({ ...approvalData, rollNo: Number(e.target.value) })}
                        className="w-full p-2 rounded-xl border border-input bg-background text-foreground"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Reject Reason Form */}
              {showRejectInput && (
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 space-y-2">
                  <label className="block font-bold text-destructive">Reason for Rejection</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Invalid Transaction ID or payment mismatch..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground text-xs"
                  />
                  <div className="flex justify-end gap-2 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowRejectInput(false)}
                      className="px-3 py-1.5 text-xs rounded-xl"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      disabled={actionLoading}
                      onClick={handleReject}
                      variant="destructive"
                      className="px-3 py-1.5 text-xs rounded-xl"
                    >
                      Confirm Reject
                    </Button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {!showRejectInput && (
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  {selectedAdmission.status === "PENDING" ? (
                    <>
                      <Button
                        onClick={() => setShowRejectInput(true)}
                        variant="destructive"
                        className="px-4 py-2 text-xs rounded-xl flex items-center gap-1.5"
                      >
                        <FaUserTimes />
                        <span>Reject</span>
                      </Button>

                      <Button
                        onClick={handleApprove}
                        disabled={actionLoading}
                        className="bg-primary text-primary-foreground px-4 py-2 text-xs rounded-xl flex items-center gap-1.5"
                      >
                        {actionLoading ? <FaSpinner className="animate-spin" /> : <FaUserCheck />}
                        <span>Approve & Create Student</span>
                      </Button>
                    </>
                  ) : (
                    <div className="w-full text-center">
                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase ${
                          selectedAdmission.status === "APPROVED"
                            ? "bg-emerald-500/10 text-emerald-600"
                            : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        Status: {selectedAdmission.status}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}