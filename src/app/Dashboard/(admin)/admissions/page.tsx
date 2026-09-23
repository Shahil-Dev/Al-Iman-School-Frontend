"use client";

import React, { useEffect, useState } from "react";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
  FaSearch,
  FaFilter,
  FaEye,
  FaUniversity,
  FaPhoneAlt,
  FaMoneyBillWave,
  FaExclamationTriangle,
  FaGraduationCap,
} from "react-icons/fa";
import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { academicService } from "@/src/Services/academicService";
import { admissionApi } from "@/src/Services/admissionApi";
import { toast } from "sonner";

export default function AdminAdmissionManagementPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [classesList, setClassesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [classFilter, setClassFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Modal State
  const [selectedApp, setSelectedApp] = useState<any | null>(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Load Applications & Classes
  const fetchData = async () => {
    setLoading(true);
    try {
      const [appRes, classRes] = await Promise.all([
        admissionApi
          .getAllApplications({
            status: statusFilter,
            classId: classFilter,
            searchTerm,
          })
          .catch(() => ({ data: [] })), // Handles empty or API error gracefully

        academicService.getAllClasses().catch(() => ({ data: [] })),
      ]);

      setApplications(appRes?.data || appRes || []);
      setClassesList(classRes?.data || classRes || []);
    } catch (err: any) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter, classFilter]);

  // Handle Search Submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  // Approve Application Handler
  const handleApprove = async (id: string) => {
    setProcessingId(id);
    const toastId = toast.loading(
      "Approving admission & creating student profile...",
    );

    try {
      await admissionApi.approveAdmission(id);
      toast.success(
        "Admission approved successfully! Student account created.",
        { id: toastId },
      );
      setSelectedApp(null);
      fetchData();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to approve admission",
        { id: toastId },
      );
    } finally {
      setProcessingId(null);
    }
  };

  // Reject Application Handler
  const handleRejectSubmit = async () => {
    if (!selectedApp || !rejectReason.trim()) {
      toast.error("Please provide a valid rejection reason!");
      return;
    }

    setProcessingId(selectedApp.id);
    const toastId = toast.loading(
      "Rejecting application & notifying student...",
    );

    try {
      await admissionApi.rejectAdmission(selectedApp.id, rejectReason);
      toast.success("Application rejected and email notification sent.", {
        id: toastId,
      });
      setIsRejectModalOpen(false);
      setSelectedApp(null);
      setRejectReason("");
      fetchData();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to reject admission",
        { id: toastId },
      );
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-6 rounded-2xl shadow-md">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FaGraduationCap />
            <span>Admission Applications Management</span>
          </h1>
          <p className="text-xs text-emerald-100/80 mt-1">
            Review online application submissions, verify payments, approve
            student enrollment, or issue rejections.
          </p>
        </div>
        <div className="bg-emerald-950/60 px-4 py-2 rounded-xl border border-emerald-500/30 text-xs font-semibold">
          Total Applications:{" "}
          <span className="text-emerald-300 font-bold">
            {applications.length}
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <Card className="border-border shadow-sm rounded-2xl">
        <CardContent className="p-4">
          <form
            onSubmit={handleSearch}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs"
          >
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search by Name, Phone, TrxID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-input bg-background focus:ring-2 focus:ring-emerald-500/20"
              />
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <FaFilter className="text-muted-foreground" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-input bg-background font-semibold"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            {/* Class Filter */}
            <div>
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-input bg-background font-semibold"
              >
                <option value="ALL">All Classes</option>
                {classesList.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Filter */}
            <Button
              type="submit"
              className="bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold"
            >
              Apply Filter
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card className="border-border shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
              <FaSpinner className="animate-spin text-emerald-600 text-lg" />
              Loading admission applications...
            </div>
          ) : applications.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <FaExclamationTriangle className="mx-auto text-amber-500 text-2xl" />
              <p className="text-sm font-semibold">
                No admission applications found!
              </p>
              <p className="text-xs text-muted-foreground">
                Try adjusting your filters or search terms.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted text-muted-foreground uppercase tracking-wider border-b border-border">
                  <tr>
                    <th className="p-3.5">App No & Date</th>
                    <th className="p-3.5">Student Name</th>
                    <th className="p-3.5">Target Class</th>
                    <th className="p-3.5">Payment Details</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {applications.map((app) => (
                    <tr
                      key={app.id}
                      className="hover:bg-muted/40 transition-colors"
                    >
                      <td className="p-3.5">
                        <span className="font-mono font-bold text-emerald-700 block">
                          {app.applicationNo}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(app.createdAt).toLocaleDateString()}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span className="font-bold block text-foreground">
                          {app.studentName}
                        </span>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <FaPhoneAlt className="text-[9px]" /> {app.phone}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span className="font-semibold text-foreground">
                          {app.class?.name || "N/A"}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200 block">
                          TrxID: {app.transactionId}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {app.paymentMethod} • {app.amount} BDT (
                          {app.senderPhone})
                        </span>
                      </td>

                      <td className="p-3.5">
                        {app.status === "APPROVED" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            <FaCheckCircle /> Approved
                          </span>
                        )}
                        {app.status === "PENDING" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                            <FaSpinner className="animate-spin text-[9px]" />{" "}
                            Pending
                          </span>
                        )}
                        {app.status === "REJECTED" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                            <FaTimesCircle /> Rejected
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 text-right space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedApp(app)}
                          className="text-xs h-8 rounded-lg"
                        >
                          <FaEye className="mr-1" /> View
                        </Button>

                        {app.status === "PENDING" && (
                          <>
                            <Button
                              size="sm"
                              disabled={processingId === app.id}
                              onClick={() => handleApprove(app.id)}
                              className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs h-8 rounded-lg"
                            >
                              Approve
                            </Button>

                            <Button
                              variant="destructive"
                              size="sm"
                              disabled={processingId === app.id}
                              onClick={() => {
                                setSelectedApp(app);
                                setIsRejectModalOpen(true);
                              }}
                              className="text-xs h-8 rounded-lg"
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Application Modal */}
      {selectedApp && !isRejectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-background max-w-2xl w-full rounded-2xl shadow-2xl overflow-hidden border border-border max-h-[90vh] flex flex-col">
            <div className="p-4 bg-emerald-800 text-white flex justify-between items-center">
              <h2 className="font-bold text-sm">
                Application Details #{selectedApp.applicationNo}
              </h2>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-white hover:opacity-80 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-muted p-3 rounded-xl">
                <p>
                  <b>Applicant Name:</b> {selectedApp.studentName}
                </p>
                <p>
                  <b>Gender:</b> {selectedApp.gender}
                </p>
                <p>
                  <b>Date of Birth:</b>{" "}
                  {new Date(selectedApp.dateOfBirth).toLocaleDateString()}
                </p>
                <p>
                  <b>Target Class:</b> {selectedApp.class?.name}
                </p>
                <p>
                  <b>Religion / Country:</b> {selectedApp.religion} /{" "}
                  {selectedApp.country}
                </p>
                <p>
                  <b>Blood Group:</b> {selectedApp.bloodGroup || "N/A"}
                </p>
              </div>

              <div className="space-y-1">
                <h3 className="font-bold text-emerald-800 uppercase text-[11px] border-b pb-1">
                  Parents & Contact
                </h3>
                <p>
                  <b>Father Name:</b> {selectedApp.fatherName} (
                  {selectedApp.fatherOccupation || "N/A"})
                </p>
                <p>
                  <b>Mother Name:</b> {selectedApp.motherName} (
                  {selectedApp.motherOccupation || "N/A"})
                </p>
                <p>
                  <b>Phone / Email:</b> {selectedApp.phone} |{" "}
                  {selectedApp.email}
                </p>
                <p>
                  <b>Guardian Phone:</b> {selectedApp.guardianPhone}
                </p>
                <p>
                  <b>Present Address:</b> {selectedApp.presentAddress}
                </p>
              </div>

              <div className="space-y-1 bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-200">
                <h3 className="font-bold text-emerald-900 uppercase text-[11px] border-b pb-1">
                  Payment Verification
                </h3>
                <p>
                  <b>Method:</b> {selectedApp.paymentMethod}
                </p>
                <p>
                  <b>Sender Phone:</b> {selectedApp.senderPhone}
                </p>
                <p>
                  <b>TrxID:</b>{" "}
                  <span className="font-mono font-bold text-emerald-700">
                    {selectedApp.transactionId}
                  </span>
                </p>
                <p>
                  <b>Amount:</b> {selectedApp.amount} BDT
                </p>
              </div>
            </div>

            <div className="p-4 border-t bg-muted flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSelectedApp(null)}>
                Close
              </Button>
              {selectedApp.status === "PENDING" && (
                <Button
                  onClick={() => handleApprove(selectedApp.id)}
                  className="bg-emerald-700 text-white font-bold"
                >
                  Approve Admission
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {isRejectModalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-background max-w-md w-full rounded-2xl shadow-2xl p-6 border border-border space-y-4">
            <h3 className="font-bold text-sm text-destructive flex items-center gap-2">
              <FaTimesCircle /> Reject Admission Application
            </h3>
            <p className="text-xs text-muted-foreground">
              Please specify the reason for rejecting{" "}
              <b>{selectedApp.studentName}</b>'s application. An automated email
              notification will be sent.
            </p>

            <textarea
              rows={3}
              required
              placeholder="e.g. Invalid Transaction ID (TrxID) or duplicate payment submission."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-input bg-background text-xs"
            />

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsRejectModalOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleRejectSubmit}>
                Confirm Rejection
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
