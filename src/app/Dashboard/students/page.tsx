"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  UserPlus,
  GraduationCap,
  Mail,
  Phone,
  MoreVertical,
  X,
} from "lucide-react";

export default function StudentsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    gender: "MALE",
    studentId: "",
    classId: "",
    sectionId: "",
    rollNumber: "",
    parentId: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // API Call to /api/users/student
    console.log("Creating Student:", formData);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <GraduationCap className="w-7 h-7 text-emerald-600" />
            Student Management
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage student enrollments, profiles, and academic allocations.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
        >
          <UserPlus className="w-5 h-5" />
          Add New Student
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name or ID..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <select className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
            <option value="">All Classes</option>
            <option value="6">Class 6</option>
            <option value="7">Class 7</option>
            <option value="8">Class 8</option>
          </select>

          <select className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
            <option value="">All Sections</option>
            <option value="A">Section A</option>
            <option value="B">Section B</option>
          </select>
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-4">Student Name</th>
                <th className="p-4">Student ID / Roll</th>
                <th className="p-4">Class & Section</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-sm">
                      AH
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        Arif Hossain
                      </p>
                      <p className="text-xs text-slate-400">arif@example.com</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 font-mono text-xs">
                  <span className="font-semibold text-slate-800">
                    STU-2026-001
                  </span>
                  <p className="text-slate-400">Roll: 01</p>
                </td>
                <td className="p-4">
                  <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded text-xs font-medium">
                    Class 6 - Sec A
                  </span>
                </td>
                <td className="p-4 text-xs">
                  <p className="flex items-center gap-1 text-slate-600">
                    <Phone className="w-3 h-3" /> +880 1700 000000
                  </p>
                </td>
                <td className="p-4">
                  <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                    Active
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button className="text-slate-400 hover:text-slate-600 p-1">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <h3 className="text-lg font-bold text-slate-800">
                Register New Student
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tanvir Ahmed"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. student@school.com"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="+88017..."
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Student ID / Roll No
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 101"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={formData.rollNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, rollNumber: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Class
                  </label>
                  <select
                    required
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                    value={formData.classId}
                    onChange={(e) =>
                      setFormData({ ...formData, classId: e.target.value })
                    }
                  >
                    <option value="">Select Class</option>
                    <option value="class-6">Class 6</option>
                    <option value="class-7">Class 7</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Section
                  </label>
                  <select
                    required
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                    value={formData.sectionId}
                    onChange={(e) =>
                      setFormData({ ...formData, sectionId: e.target.value })
                    }
                  >
                    <option value="">Select Section</option>
                    <option value="sec-a">Section A</option>
                    <option value="sec-b">Section B</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Gender
                  </label>
                  <select
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                    value={formData.gender}
                    onChange={(e) =>
                      setFormData({ ...formData, gender: e.target.value })
                    }
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
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
                  Save Student Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
