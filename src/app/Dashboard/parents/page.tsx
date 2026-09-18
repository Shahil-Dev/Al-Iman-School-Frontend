"use client";

import { useState } from "react";
import { Plus, Search, UserCheck, UserPlus, Phone, Mail, X } from "lucide-react";

export default function ParentsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    occupation: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Creating Parent:", formData);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <UserCheck className="w-7 h-7 text-emerald-600" />
            Parents Directory
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage guardian accounts and student associations.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
        >
          <UserPlus className="w-5 h-5" />
          Add Parent Profile
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search parent name or phone..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
            <tr>
              <th className="p-4">Parent Name</th>
              <th className="p-4">Contact Information</th>
              <th className="p-4">Occupation</th>
              <th className="p-4">Linked Students</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr className="hover:bg-slate-50">
              <td className="p-4 font-semibold text-slate-900">Rafiqul Islam</td>
              <td className="p-4 text-xs">
                <p className="text-slate-700">rafiq@example.com</p>
                <p className="text-slate-400">+880 1711 223344</p>
              </td>
              <td className="p-4 text-xs">Businessman</td>
              <td className="p-4">
                <span className="bg-emerald-50 text-emerald-700 text-xs px-2.5 py-1 rounded-md font-medium">
                  Arif Hossain (Class 6-A)
                </span>
              </td>
              <td className="p-4 text-right">
                <button className="text-xs font-semibold text-emerald-600 hover:text-emerald-800">
                  Manage Link
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Add Parent Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <h3 className="text-lg font-bold text-slate-800">Create Parent Profile</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-sm"
                >
                  Save Parent
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}