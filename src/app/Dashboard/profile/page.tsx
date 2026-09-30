"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@/src/context/UserContext";
import { useLanguage } from "@/src/context/LanguageContext";
import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { toast } from "sonner";
import axiosInstance from "@/src/lib/axiosInstance";
import {
  FaUserCircle,
  FaKey,
  FaEnvelope,
  FaPhone,
  FaIdBadge,
  FaGraduationCap,
  FaLock,
  FaSpinner,
  FaCheckCircle,
} from "react-icons/fa";

export default function ProfilePage() {
  const { user } = useUser();
  const { language } = useLanguage();
  const isBn = language === "bn";

  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Password Change State
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPass, setChangingPass] = useState(false);

  // Fetch Full Profile Info
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await axiosInstance.get("/auth/me");
        setProfileData(res.data?.data || res.data);
      } catch (err: any) {
        toast.error(
          isBn ? "প্রোফাইল তথ্য লোড করতে ব্যর্থ হয়েছে" : "Failed to load profile data"
        );
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [isBn]);

  // Password Change Handler
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error(
        isBn ? "নতুন পাসওয়ার্ড ও কনফার্ম পাসওয়ার্ড মিলেনি!" : "New passwords do not match!"
      );
      return;
    }

    if (newPassword.length < 6) {
      toast.error(
        isBn ? "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে" : "Password must be at least 6 characters"
      );
      return;
    }

    setChangingPass(true);
    try {
      await axiosInstance.patch("/auth/change-password", {
        oldPassword,
        newPassword,
      });

      toast.success(
        isBn ? "পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে!" : "Password changed successfully!"
      );

      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message ||
        (isBn ? "পাসওয়ার্ড পরিবর্তন ফেইল করেছে" : "Failed to change password");
      toast.error(errorMsg);
    } finally {
      setChangingPass(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <FaSpinner className="animate-spin text-primary text-2xl" />
        <p className="text-xs text-muted-foreground">
          {isBn ? "প্রোফাইল লোড হচ্ছে..." : "Loading Profile..."}
        </p>
      </div>
    );
  }

  const role = user?.role || "USER";
  const student = profileData?.studentProfile;
  const teacher = profileData?.teacherProfile;
  const parent = profileData?.parentProfile;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-primary/90 via-primary to-emerald-800 text-primary-foreground p-6 sm:p-8 shadow-md overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center gap-5 relative z-10">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-background/20 backdrop-blur-md border-2 border-primary-foreground/30 flex items-center justify-center text-primary-foreground text-3xl font-bold shadow-lg overflow-hidden shrink-0">
            {student?.photoUrl ? (
              <img
                src={student.photoUrl}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <FaUserCircle className="text-5xl text-primary-foreground/80" />
            )}
          </div>

          <div className="text-center sm:text-left space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              {student
                ? `${student.firstName} ${student.lastName}`
                : teacher
                ? `${teacher.firstName} ${teacher.lastName}`
                : user?.name || "User Profile"}
            </h1>
            <p className="text-xs text-primary-foreground/80 font-mono flex items-center justify-center sm:justify-start gap-2">
              <FaEnvelope className="text-[11px]" />
              <span>{user?.email || profileData?.email}</span>
            </p>
            <div className="inline-block mt-2 px-3 py-1 rounded-full bg-background/20 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider">
              {role.replace("_", " ")}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Basic Information Details */}
        <Card className="md:col-span-2 border-border shadow-sm rounded-2xl">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
              <FaIdBadge className="text-primary" />
              <span>{isBn ? "ব্যক্তিগত তথ্য" : "Personal Information"}</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-muted/40 space-y-1">
                <span className="text-muted-foreground text-[10px] uppercase font-semibold">
                  {isBn ? "ইউজার আইডি/কোড" : "User Code / ID"}
                </span>
                <p className="font-mono font-bold text-foreground">
                  {student?.studentCode || teacher?.employeeId || profileData?.id}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-muted/40 space-y-1">
                <span className="text-muted-foreground text-[10px] uppercase font-semibold">
                  {isBn ? "ইমেইল এড্রেস" : "Email Address"}
                </span>
                <p className="font-semibold text-foreground truncate">
                  {profileData?.email}
                </p>
              </div>

              {(student?.phone || teacher?.phone || parent?.phone) && (
                <div className="p-3 rounded-xl bg-muted/40 space-y-1">
                  <span className="text-muted-foreground text-[10px] uppercase font-semibold">
                    {isBn ? "ফোন নম্বর" : "Phone Number"}
                  </span>
                  <p className="font-mono font-semibold text-foreground">
                    {student?.phone || teacher?.phone || parent?.phone}
                  </p>
                </div>
              )}

              {student && (
                <>
                  <div className="p-3 rounded-xl bg-muted/40 space-y-1">
                    <span className="text-muted-foreground text-[10px] uppercase font-semibold">
                      {isBn ? "শ্রেণী ও রোল" : "Class & Roll"}
                    </span>
                    <p className="font-semibold text-foreground">
                      Class: {student.class?.name || "N/A"} | Roll: {student.rollNo}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/40 space-y-1">
                    <span className="text-muted-foreground text-[10px] uppercase font-semibold">
                      {isBn ? "পিতার নাম" : "Father Name"}
                    </span>
                    <p className="font-semibold text-foreground">
                      {student.fatherName || "N/A"}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/40 space-y-1">
                    <span className="text-muted-foreground text-[10px] uppercase font-semibold">
                      {isBn ? "রক্তের গ্রুপ" : "Blood Group"}
                    </span>
                    <p className="font-semibold text-primary font-bold">
                      {student.bloodGroup || "N/A"}
                    </p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Change Password Card */}
        <Card className="border-border shadow-sm rounded-2xl">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
              <FaKey className="text-primary" />
              <span>{isBn ? "পাসওয়ার্ড পরিবর্তন" : "Change Password"}</span>
            </h2>

            <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-muted-foreground">
                  {isBn ? "বর্তমান পাসওয়ার্ড" : "Current Password"}
                </label>
                <input
                  type="password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-muted-foreground">
                  {isBn ? "নতুন পাসওয়ার্ড" : "New Password"}
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-muted-foreground">
                  {isBn ? "নতুন পাসওয়ার্ড নিশ্চিত করুন" : "Confirm New Password"}
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-2.5 rounded-xl border border-input bg-background text-foreground"
                />
              </div>

              <Button
                type="submit"
                disabled={changingPass}
                className="w-full mt-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl text-xs py-2.5"
              >
                {changingPass ? (
                  <span className="flex items-center gap-2">
                    <FaSpinner className="animate-spin" />
                    {isBn ? "পরিবর্তন হচ্ছে..." : "Updating..."}
                  </span>
                ) : (
                  <span>{isBn ? "পাসওয়ার্ড সেভ করুন" : "Update Password"}</span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}