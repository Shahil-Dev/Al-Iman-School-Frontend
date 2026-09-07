"use client";

import { Button } from "@base-ui/react";
import Link from "next/link";
import React, { useState } from "react";
import { FaGraduationCap, FaBars, FaTimes, FaSignInAlt } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Navigation items for better maintainability
  const navItems = [
    { label: "Home", href: "/" },
    { label: "About Us", href: "#about" },
    { label: "Notice Board", href: "#notices" },
    { label: "Teachers", href: "#teachers" },
    { label: "Online Admission", href: "/admission", active: true },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/98 backdrop-blur-sm border-b border-slate-200/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px] lg:h-20">
          {/* Logo & Brand Name */}
          <Link
            href="/"
            className="flex items-center gap-3 group"
            aria-label="Al-Iman School Home"
          >
            <motion.div
              className="relative p-2.5 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl text-white shadow-md shadow-indigo-200/50 transition-shadow hover:shadow-indigo-300/70"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaGraduationCap className="text-2xl" />
              <motion.div
                className="absolute inset-0 rounded-2xl bg-white/10"
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </motion.div>
            <div className="leading-tight">
              <span className="text-xl font-extrabold text-slate-900 tracking-tight block">
                Al-Iman School
              </span>
              <span className="text-[11px] font-medium text-slate-500 block -mt-0.5 tracking-wide uppercase">
                Management ERP System
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2" aria-label="Main navigation">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`relative px-3 lg:px-4 py-2 text-sm font-medium transition-all duration-200 
                  ${
                    item.active
                      ? "text-indigo-600"
                      : "text-slate-600 hover:text-indigo-600"
                  }`}
              >
                {item.label}
                {item.active && (
                  <motion.span
                    className="absolute inset-x-3 bottom-0 h-0.5 bg-gradient-to-r from-indigo-500 to-indigo-700 rounded-full"
                    layoutId="activeNav"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                {!item.active && (
                  <motion.span
                    className="absolute inset-x-3 bottom-0 h-0.5 bg-indigo-500 rounded-full opacity-0"
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.15 }}
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center">
            <Link href="/login" aria-label="Portal Login">
              <Button className="group relative bg-gradient-to-br from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl px-5 py-2.5 shadow-md shadow-indigo-200/50 transition-all duration-200 hover:shadow-lg hover:shadow-indigo-300/70 flex items-center gap-2 overflow-hidden">
                <motion.span
                  className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={false}
                />
                <FaSignInAlt className="text-sm" />
                <span className="font-medium">Portal Login</span>
                <motion.span
                  className="absolute -inset-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.8 }}
                />
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-indigo-600 text-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg transition-colors"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
            whileTap={{ scale: 0.9 }}
          >
            {isOpen ? <FaTimes /> : <FaBars />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{
              duration: 0.3,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="md:hidden overflow-hidden border-b border-slate-200/50 bg-white/98"
          >
            <div className="px-4 py-4 space-y-1">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: index * 0.05,
                    duration: 0.25,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`block px-3 py-3 rounded-xl transition-all duration-200 text-base font-medium
                      ${
                        item.active
                          ? "text-indigo-600 bg-indigo-50/80"
                          : "text-slate-700 hover:text-indigo-600 hover:bg-slate-50"
                      }`}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: navItems.length * 0.05,
                  duration: 0.25,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="pt-3 mt-2 border-t border-slate-200/50"
              >
                <Link href="/login" onClick={() => setIsOpen(false)}>
                  <Button className="w-full bg-gradient-to-br from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl px-4 py-3 flex items-center justify-center gap-2 shadow-md shadow-indigo-200/50 transition-all duration-200">
                    <FaSignInAlt className="text-sm" />
                    <span className="font-medium">Portal Login</span>
                  </Button>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};