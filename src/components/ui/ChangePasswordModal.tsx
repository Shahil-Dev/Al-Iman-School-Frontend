"use client";

import React, { useState } from "react";
import { FaLock, FaKey, FaSpinner, FaCheckCircle } from "react-icons/fa";
import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { toast } from "sonner";
import axiosInstance from "@/src/lib/axiosInstance";

export default function ChangePasswordForm() {
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New password & confirm password do not match!");
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long!");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Updating password...");

    try {
      await axiosInstance.patch("/auth/change-password", {
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
      });

      toast.success("Password updated successfully!", { id: toastId });
      setFormData({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to change password", {
        id: toastId,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-border shadow-sm rounded-2xl max-w-md mx-auto">
      <CardContent className="p-6 space-y-4 font-sans">
        <h3 className="text-base font-bold text-foreground flex items-center gap-2 border-b pb-2">
          <FaLock className="text-emerald-600" />
          <span>Change Password</span>
        </h3>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold mb-1">
              Current / Default Password *
            </label>
            <input
              type="password"
              required
              placeholder="e.g. Student@123456"
              value={formData.oldPassword}
              onChange={(e) =>
                setFormData({ ...formData, oldPassword: e.target.value })
              }
              className="w-full p-2.5 rounded-xl border border-input bg-background font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">New Password *</label>
            <input
              type="password"
              required
              placeholder="Enter new strong password"
              value={formData.newPassword}
              onChange={(e) =>
                setFormData({ ...formData, newPassword: e.target.value })
              }
              className="w-full p-2.5 rounded-xl border border-input bg-background font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">
              Confirm New Password *
            </label>
            <input
              type="password"
              required
              placeholder="Re-enter new password"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              className="w-full p-2.5 rounded-xl border border-input bg-background font-mono"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold mt-2"
          >
            {loading ? <FaSpinner className="animate-spin" /> : <FaKey />}{" "}
            Update Password
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
