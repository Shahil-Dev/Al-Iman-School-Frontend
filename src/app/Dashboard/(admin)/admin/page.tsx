"use client";

import React from "react";
import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaFileInvoiceDollar,
  FaUserClock,
  FaArrowUp,
} from "react-icons/fa";
import { Card, CardContent } from "@/src/components/ui/card";

const stats = [
  {
    title: "Total Students",
    value: "1,240",
    change: "+12% this month",
    icon: FaUserGraduate,
    color: "text-blue-500 bg-blue-500/10",
  },
  {
    title: "Total Teachers",
    value: "48",
    change: "Active Staff",
    icon: FaChalkboardTeacher,
    color: "text-emerald-500 bg-emerald-500/10",
  },
  {
    title: "Pending Admissions",
    value: "15",
    change: "Requires Action",
    icon: FaUserClock,
    color: "text-amber-500 bg-amber-500/10",
  },
  {
    title: "Total Revenue",
    value: "৳ 450,000",
    change: "+8% this term",
    icon: FaFileInvoiceDollar,
    color: "text-purple-500 bg-purple-500/10",
  },
];

export default function AdminOverviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-foreground">
          Admin Dashboard Overview
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Welcome back! Here is what is happening in Al-Iman School today.
        </p>
      </div>

      {/* Metric Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card
              key={idx}
              className="border-border/60 shadow-sm rounded-2xl bg-card"
            >
              <CardContent className="p-5 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </p>
                  <p className="text-[10px] font-medium text-emerald-600 flex items-center gap-1">
                    <FaArrowUp className="text-[8px]" />
                    <span>{stat.change}</span>
                  </p>
                </div>
                <div className={`p-3.5 rounded-2xl ${stat.color}`}>
                  <Icon className="text-xl" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Action Section */}
      <Card className="border-border/60 shadow-sm rounded-2xl bg-card">
        <CardContent className="p-6">
          <h3 className="text-sm font-bold text-foreground mb-2">
            Quick Actions
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            Perform primary administrative tasks in a single click.
          </p>
          <div className="flex flex-wrap gap-3">
            <button className="px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-sm">
              Approve New Admissions
            </button>
            <button className="px-4 py-2 bg-muted text-foreground text-xs font-semibold rounded-xl hover:bg-muted/80 transition-colors">
              Add New Student
            </button>
            <button className="px-4 py-2 bg-muted text-foreground text-xs font-semibold rounded-xl hover:bg-muted/80 transition-colors">
              Create Fee Invoice
            </button>
          </div>
        </CardContent>

        
      </Card>
    </div>
  );
}
