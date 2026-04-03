"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Upload, 
  LogOut, 
  Menu, 
  X,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { name: "JDs", path: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Upload Resume", path: "/admin/upload", icon: Upload },
];

export default function AdminShell({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const res = await fetch("/api/logout", { method: "POST" });
      if (res.ok) {
        router.push("/login");
        router.refresh();
      }
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const NavContent = ({ mobile = false }) => (
    <nav className="flex flex-col gap-2 p-4">
      {navItems.map((item) => {
        const isActive = pathname === item.path;
        return (
          <Link
            key={item.path}
            href={item.path}
            onClick={() => mobile && setIsMobileMenuOpen(false)}
            className={`flex items-center justify-between px-4 py-3 rounded-xl transition duration-200 group ${
              isActive 
                ? "bg-[#0284C7] text-white shadow-md shadow-sky-100" 
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <div className="flex items-center gap-3">
              <item.icon size={20} className={isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"} />
              <span className="font-medium">{item.name}</span>
            </div>
            {isActive && <ChevronRight size={16} />}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-slate-200 fixed h-full shadow-sm z-50">
        <div className="p-6 border-b border-slate-50">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#0284C7] rounded-lg flex items-center justify-center text-white font-bold">T</div>
            <span className="text-xl font-bold text-slate-800 tracking-tight">TriageList</span>
          </Link>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <NavContent />
        </div>

        <div className="p-4 border-t border-slate-50">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition duration-200 disabled:opacity-50"
          >
            <LogOut size={20} />
            <span className="font-medium">{isLoggingOut ? "Signing out..." : "Logout"}</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar (Drawer) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-80 bg-white shadow-2xl z-[70] lg:hidden flex flex-col"
            >
              <div className="p-6 flex items-center justify-between border-b border-slate-50">
                <Link href="/admin/dashboard" className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#0284C7] rounded-lg flex items-center justify-center text-white font-bold">T</div>
                  <span className="text-xl font-bold text-slate-800 tracking-tight">TriageList</span>
                </Link>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400">
                  <X size={24} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <NavContent mobile />
              </div>
              <div className="p-6 border-t border-slate-50">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-500 bg-red-50 rounded-xl font-medium"
                >
                  <LogOut size={20} />
                  Logout
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 lg:pl-72 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 flex items-center justify-between lg:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 hover:bg-slate-100 rounded-lg text-slate-600"
            >
              <Menu size={24} />
            </button>
            <div className="lg:hidden flex items-center gap-2">
              <div className="w-6 h-6 bg-[#0284C7] rounded flex items-center justify-center text-white text-xs font-bold font-sans">T</div>
              <span className="text-lg font-bold text-slate-800 tracking-tight">TriageList</span>
            </div>
            {/* Context Breadcrumb or Search could go here */}
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end mr-2">
              <span className="text-sm font-semibold text-slate-700">Admin User</span>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Full Access</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[#0284C7] font-bold shadow-inner">
              AD
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
