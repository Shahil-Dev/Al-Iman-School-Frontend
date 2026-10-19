"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Hind_Siliguri, Noto_Serif_Bengali } from "next/font/google";

const body = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const display = Noto_Serif_Bengali({
  subsets: ["bengali", "latin"],
  weight: ["500", "600"],
  display: "swap",
});

const EASE = [0.22, 1, 0.36, 1] as const;

export default function NotFound() {
  const router = useRouter();
  const pathname = usePathname();
  const reduce = useReducedMotion();

  // One drawn stroke at a time: the two 4s first, the circle last.
  const draw = (delay: number, duration: number) =>
    reduce
      ? {}
      : {
          initial: { pathLength: 0, opacity: 0 },
          animate: { pathLength: 1, opacity: 1 },
          transition: {
            pathLength: { delay, duration, ease: EASE },
            opacity: { delay, duration: 0.01 },
          },
        };

  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push("/");
  };

  return (
    <main
      className={`${body.className} relative flex min-h-[100dvh] items-center overflow-hidden bg-slate-950 px-6 py-16 text-slate-100 sm:px-10`}
    >
      {/* A single, quiet pool of light behind the numerals */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60rem 36rem at 22% 42%, rgba(52,211,153,0.07), transparent 70%)",
        }}
      />

      <div className="relative z-10 mx-auto grid w-full max-w-5xl items-end gap-12 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
        {/* 404 — drawn with one stroke weight; the open circle is the missing page */}
        <svg
          role="img"
          aria-label="404"
          viewBox="0 0 570 200"
          className="w-full max-w-[34rem] overflow-visible"
          fill="none"
          strokeWidth={14}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <g stroke="currentColor" className="text-slate-100">
            <motion.path d="M118 8 L12 140 H156" {...draw(0.1, 0.9)} />
            <motion.path d="M118 8 V192" {...draw(0.35, 0.7)} />
            <g transform="translate(408 0)">
              <motion.path d="M118 8 L12 140 H156" {...draw(0.7, 0.9)} />
              <motion.path d="M118 8 V192" {...draw(0.95, 0.7)} />
            </g>
          </g>
          <motion.path
            d="M349.7 54 A92 92 0 1 1 301.5 13.5"
            stroke="currentColor"
            className="text-emerald-400"
            {...draw(0.45, 1.4)}
          />
        </svg>

        <motion.div
          initial={reduce ? false : { opacity: 0, filter: "blur(6px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ delay: reduce ? 0 : 1.1, duration: 0.8, ease: EASE }}
          className="max-w-md"
        >
          <h1
            className={`${display.className} text-3xl font-semibold leading-snug text-slate-50 sm:text-4xl`}
          >
            পাতাটি খুঁজে পাওয়া যায়নি
          </h1>

          <p className="mt-5 text-base leading-8 text-slate-300">
            আপনি যে ঠিকানাটি খুলতে চেয়েছিলেন, সেখানে কোনো পাতা নেই। পাতাটি সরানো
            হয়ে থাকতে পারে, অথবা লিংকটিতে ভুল আছে।
          </p>

          {pathname && (
            <p className="mt-6 border-l-2 border-emerald-400/40 pl-4 text-sm text-slate-400">
              <span className="sr-only">অনুরোধ করা ঠিকানা: </span>
              <code className="break-all font-mono text-[0.8125rem] text-slate-300">
                {pathname}
              </code>
            </p>
          )}

          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
            <Link
              href="/"
              className="inline-flex items-center rounded-lg bg-emerald-400 px-6 py-3 text-base font-semibold text-slate-950 transition duration-200 hover:bg-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100"
            >
              হোম পেজে ফিরে যান
            </Link>

            <button
              type="button"
              onClick={goBack}
              className="rounded-sm text-base font-medium text-slate-300 underline decoration-slate-600 underline-offset-[6px] transition-colors duration-200 hover:text-white hover:decoration-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              আগের পাতায় ফিরুন
            </button>
          </div>
        </motion.div>
      </div>
    </main>
  );
}