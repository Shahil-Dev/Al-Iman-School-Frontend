"use client";

import React from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useUser } from "@/src/context/UserContext";

export default function GlobalLoader() {
  const { loading } = useUser();

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          key="global-loader"
          role="status"
          aria-live="polite"
          aria-busy="true"
          // Fades in after a short delay so quick loads never flash the overlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.15, duration: 0.2 } }}
          exit={{ opacity: 0, transition: { duration: 0.25 } }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-background"
        >
          <div className="relative h-24 w-24">
            <span className="absolute inset-0 rounded-full border-4 border-[#B8860B]/20" />
            <span className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#B8860B] animate-spin motion-reduce:animate-none" />
            <span className="absolute inset-3 overflow-hidden rounded-full bg-white shadow-md">
              <Image
                src="/Image/logo aliman.jpg"
                alt=""
                fill
                sizes="72px"
                className="object-cover"
                priority
              />
            </span>
          </div>
          <p className="text-sm font-semibold tracking-wide text-foreground">
            Al-Iman School and College
          </p>
          <span className="sr-only">Loading…</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}