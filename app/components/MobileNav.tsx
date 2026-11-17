"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const [dropdown, setDropdown] = useState(false);
  const [role, setRole] = useState<"superadmin" | "user" | "guest" | null>(null);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);

      if (!session?.user) {
        setRole("guest");
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      setProfile(profileData);
      setRole(profileData?.role || "guest");
    };

    checkAuth();
  }, []);

  const initials =
    profile?.full_name?.slice(0, 2).toUpperCase() ||
    user?.email?.slice(0, 2).toUpperCase() ||
    "US";

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  if (role === "superadmin") return null;

  return (
    <div className="md:hidden relative">

      {/* Hamburger */}
      <button
        onClick={() => setOpen(true)}
        className="text-white text-lg"
      >
        ☰
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Slide Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-44 bg-white text-black p-4 
          z-50 shadow-xl rounded-l-xl
          transform transition-transform duration-300 ease-out
          ${open ? "translate-x-0" : "translate-x-full"}`}
      >        
        <button
          onClick={() => setOpen(false)}
          className="text-xl absolute top-2 right-3"
        >
          ✕
        </button>

        <div className="mt-8 flex flex-col gap-3">

          <Link href="/" className="border-b pb-1 text-sm" onClick={() => setOpen(false)}>
            Home
          </Link>
          <Link href="/about" className="border-b pb-1 text-sm" onClick={() => setOpen(false)}>
            About
          </Link>
          <Link href="/service" className="border-b pb-1 text-sm" onClick={() => setOpen(false)}>
            Services
          </Link>
          <Link href="/contact" className="border-b pb-1 text-sm" onClick={() => setOpen(false)}>
            Contact
          </Link>

          {/* Guest */}
          {role === "guest" && (
            <Link href="/auth" className="text-sm" onClick={() => setOpen(false)}>
              Login
            </Link>
          )}

          {/* User */}
          {role === "user" && (
            <div>
              <button
                onClick={() => setDropdown(!dropdown)}
                className="w-8 h-8 rounded-full bg-[#007BFF] text-white text-[10px] font-bold flex items-center justify-center"
              >
                {initials}
              </button>

              {dropdown && (
                <div className="mt-2 bg-gray-100 rounded p-2 shadow text-xs">
                  <Link href="/user/profile" className="block p-1 hover:bg-gray-200 rounded">My Profile</Link>
                  <Link href="/user/settings" className="block p-1 hover:bg-gray-200 rounded">Settings</Link>
                  <Link href="/user/wallet" className="block p-1 hover:bg-gray-200 rounded">Wallet</Link>
                  <Link href="/user/subscription" className="block p-1 hover:bg-gray-200 rounded">Subscription</Link>

                  <button
                    className="w-full text-left p-1 mt-1 text-red-600 hover:bg-gray-200 rounded"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
