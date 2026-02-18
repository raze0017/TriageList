"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Github } from "lucide-react";

export default function Home() {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#334155] flex items-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-3xl mx-auto px-6 w-full"
      >
        <div className="flex items-center justify-between mb-16">
          <div className="flex items-center gap-4">
            <Image
              src="/icon.png"
              alt="TriageList"
              width={48}
              height={48}
            />
            <h1 className="text-2xl font-semibold text-[#0284C7]">
              TriageList
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <motion.a
              href="https://github.com/raze0017/TriageList"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="text-[#334155] hover:text-[#0284C7] transition"
            >
              <Github size={22} />
            </motion.a>

            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xs px-3 py-1 rounded-full bg-[#14B8A6]/10 text-[#14B8A6] font-medium"
            >
              Development in Progress
            </motion.span>
          </div>
        </div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-4xl font-semibold leading-tight mb-6"
        >
          Resume triage, simplified.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.6 }}
          className="text-lg text-[#64748B] mb-12 max-w-xl"
        >
          Extract structured signals from applications and prioritize candidates
          transparently. Built for real HR workflows.
        </motion.p>

        <motion.div
          layout
          className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200"
        >
          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-sm text-[#64748B] mb-5">
                  Get early access when we launch.
                </p>

                <form
                  onSubmit={handleSubmit}
                  className="flex flex-col sm:flex-row gap-3"
                >
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0284C7]"
                  />

                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    type="submit"
                    className="px-6 py-3 rounded-lg bg-[#0284C7] text-white font-medium"
                  >
                    Request Access
                  </motion.button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                <div className="text-gray-600 font-medium text-lg">
                  Early access request received
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-sm text-[#64748B]"
        >
          Human judgment stays in control. No automated hiring decisions.
        </motion.p>
      </motion.div>
    </div>
  );
}
