"use client";

import { useState, useEffect } from "react";
import { Check, X, Clock, Search, Filter, Loader2, Eye, User, CreditCard, ShieldAlert } from "lucide-react";
import { getAdmissionRequests, updateAdmissionStatus } from "@/src/Services/admissionApi";


// Interface strictly typed based on backend JSON response
interface AdmissionApplication {
  id: string;
  studentName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  guardianName: string;
  guardianPhone: string;
  classId: string;
  paymentMethod: string;
  senderPhone: string;
  amount: number;
  transactionId: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt?: string;
}

export default function AdmissionRequestsPage() {
  const [applications, setApplications] = useState<AdmissionApplication[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  
  // Selected application state for viewing detail modal
  const [selectedApp, setSelectedApp] = useState<AdmissionApplication | null>(null);

  // Fetch dynamic admission data from server
  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await getAdmissionRequests();
      setApplications(data);
    } catch (error) {
      console.error("Failed to fetch dynamic admission requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // Update admission status handler
  const handleStatusChange = async (id: string, newStatus: "APPROVED" | "REJECTED") => {
    try {
      setActionLoadingId(id);
      await updateAdmissionStatus(id, newStatus);
      
      // Update local state and selected modal view
      setApplications((prev) =>
        prev.map((app) =>
          app.id === id ? { ...app, status: newStatus } : app
        )
      );

      if (selectedApp && selectedApp.id === id) {
        setSelectedApp((prev) => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (error) {
      console.error(`Failed to update status to ${newStatus}:`, error);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Dynamic filter for search and status
  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.phone?.includes(searchTerm);
    const matchesStatus =
      statusFilter === "ALL" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header section */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Admission Requests
        </h1>
        <p className="text-sm text-slate-500">
          Review complete applicant profile and payment verification before approving enrollment.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name, TRX ID, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Main Table View */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 flex justify-center items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
            <span>Loading admission applications...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-4">Student Name</th>
                  <th className="p-4">Contact & Address</th>
                  <th className="p-4">Guardian Details</th>
                  <th className="p-4">Payment Status</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApplications.length > 0 ? (
                  filteredApplications.map((app) => (
                    <tr key={app.id || app.transactionId} className="hover:bg-slate-50/50">
                      <td className="p-4">
                        <div className="font-semibold text-slate-900">{app.studentName}</div>
                        <div className="text-xs text-slate-400">{app.gender} | DOB: {app.dateOfBirth}</div>
                      </td>
                      <td className="p-4">
                        <div>{app.phone}</div>
                        <div className="text-xs text-slate-400">{app.email}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-slate-800">{app.guardianName}</div>
                        <div className="text-xs text-slate-400">{app.guardianPhone}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-mono text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded inline-block">
                          {app.paymentMethod}: {app.transactionId}
                        </div>
                        <div className="text-xs font-medium text-slate-500 mt-0.5">
                          Amount: {app.amount} BDT ({app.senderPhone})
                        </div>
                      </td>
                      <td className="p-4">
                        {app.status === "PENDING" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3 h-3" /> Pending
                          </span>
                        )}
                        {app.status === "APPROVED" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Check className="w-3 h-3" /> Approved
                          </span>
                        )}
                        {app.status === "REJECTED" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                            <X className="w-3 h-3" /> Rejected
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => setSelectedApp(app)}
                          className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-md text-xs font-medium hover:bg-slate-200 transition-colors inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      No matching admission applications found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Comprehensive Student Details Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 space-y-6 overflow-y-auto max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Application Details
                </h2>
                <p className="text-xs text-slate-500">
                  Review complete applicant and verification information.
                </p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Student Info Grid */}
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-emerald-600" /> Student Profile
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-xs text-slate-400 block">Full Name</span>
                    <span className="font-semibold text-slate-800">{selectedApp.studentName}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Email Address</span>
                    <span className="text-slate-700">{selectedApp.email}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Phone Number</span>
                    <span className="text-slate-700">{selectedApp.phone}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Date of Birth / Gender</span>
                    <span className="text-slate-700">{selectedApp.dateOfBirth} ({selectedApp.gender})</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-xs text-slate-400 block">Address</span>
                    <span className="text-slate-700">{selectedApp.address}</span>
                  </div>
                </div>
              </div>

              {/* Guardian Info Grid */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-emerald-600" /> Guardian Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-xs text-slate-400 block">Guardian Name</span>
                    <span className="font-semibold text-slate-800">{selectedApp.guardianName}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Guardian Contact</span>
                    <span className="text-slate-700">{selectedApp.guardianPhone}</span>
                  </div>
                </div>
              </div>

              {/* Payment Verification Grid */}
              <div className="bg-emerald-50/50 p-4 rounded-lg border border-emerald-100">
                <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-emerald-600" /> Payment & Transaction
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-xs text-slate-400 block">Payment Method</span>
                    <span className="font-bold text-emerald-700">{selectedApp.paymentMethod}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Transaction ID</span>
                    <span className="font-mono font-bold text-slate-800">{selectedApp.transactionId}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Amount Paid</span>
                    <span className="font-semibold text-slate-800">{selectedApp.amount} BDT</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Sender Phone</span>
                    <span className="text-slate-700">{selectedApp.senderPhone}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
              <span className="text-xs text-slate-400">
                Current Status: <strong className="text-slate-700">{selectedApp.status}</strong>
              </span>
              
              {selectedApp.status === "PENDING" && (
                <div className="flex gap-2">
                  <button
                    disabled={actionLoadingId === selectedApp.id}
                    onClick={() => handleStatusChange(selectedApp.id, "REJECTED")}
                    className="px-4 py-2 bg-rose-50 text-rose-600 rounded-lg text-xs font-semibold hover:bg-rose-100 transition-colors disabled:opacity-50"
                  >
                    Reject Application
                  </button>
                  <button
                    disabled={actionLoadingId === selectedApp.id}
                    onClick={() => handleStatusChange(selectedApp.id, "APPROVED")}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
                  >
                    {actionLoadingId === selectedApp.id ? "Processing..." : "Approve & Enroll"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}