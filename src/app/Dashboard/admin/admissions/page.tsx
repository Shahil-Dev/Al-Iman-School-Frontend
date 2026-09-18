"use client";

import { useState, useEffect } from "react";
import { Check, X, Clock, Search, Filter } from "lucide-react";

// Define TypeScript interfaces for application records
interface AdmissionApplication {
  id: string;
  applicantName: string;
  email: string;
  phone: string;
  appliedClass: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}

export default function AdmissionRequestsPage() {
  const [applications, setApplications] = useState<AdmissionApplication[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  // Fetch admission requests on component mount
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        // Mock data fallback or replace with actual admissionApi service call
        const mockData: AdmissionApplication[] = [
          {
            id: "ADM-101",
            applicantName: "Rahim Ahmed",
            email: "rahim@example.com",
            phone: "+8801700000000",
            appliedClass: "Class 6",
            status: "PENDING",
            createdAt: "2026-09-15",
          },
          {
            id: "ADM-102",
            applicantName: "Sumaiya Akter",
            email: "sumaiya@example.com",
            phone: "+8801800000000",
            appliedClass: "Class 8",
            status: "APPROVED",
            createdAt: "2026-09-14",
          },
        ];
        setApplications(mockData);
      } catch (error) {
        // Handle fetch failure gracefully
        console.error("Failed to load admissions data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  // Update application status handler
  const handleStatusChange = (id: string, newStatus: "APPROVED" | "REJECTED") => {
    setApplications((prev) =>
      prev.map((app) =>
        app.id === id ? { ...app, status: newStatus } : app
      )
    );
  };

  // Filter records based on user search and dropdown selection
  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "ALL" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Section Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Admission Requests
        </h1>
        <p className="text-sm text-slate-500">
          Review, approve, or reject new student admission applications.
        </p>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or ID..."
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

      {/* Applications Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading requests...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-4">App ID</th>
                  <th className="p-4">Applicant</th>
                  <th className="p-4">Target Class</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApplications.length > 0 ? (
                  filteredApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/50">
                      <td className="p-4 font-mono text-xs font-semibold text-slate-500">
                        {app.id}
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-slate-900">
                          {app.applicantName}
                        </div>
                        <div className="text-xs text-slate-400">{app.email}</div>
                      </td>
                      <td className="p-4">{app.appliedClass}</td>
                      <td className="p-4 text-xs text-slate-500">{app.createdAt}</td>
                      <td className="p-4">
                        {app.status === "PENDING" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3 h-3" /> Pending
                          </span>
                        )}
                        {app.status === "APPROVED" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Check className="w-3 h-3" /> Approved
                          </span>
                        )}
                        {app.status === "REJECTED" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                            <X className="w-3 h-3" /> Rejected
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        {app.status === "PENDING" && (
                          <>
                            <button
                              onClick={() => handleStatusChange(app.id, "APPROVED")}
                              className="px-3 py-1.5 bg-emerald-600 text-white rounded-md text-xs font-medium hover:bg-emerald-700 transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleStatusChange(app.id, "REJECTED")}
                              className="px-3 py-1.5 bg-slate-100 text-rose-600 rounded-md text-xs font-medium hover:bg-rose-50 hover:text-rose-700 transition-colors"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      No admission applications found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}