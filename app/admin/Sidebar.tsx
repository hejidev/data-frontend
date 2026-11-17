"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Settings,
  ChevronDown,
  LogOut,
  Menu,
  LifeBuoy,
  Activity,
  CheckCircle,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [openMenu, setOpenMenu] = useState(true);
  const [showMobile, setShowMobile] = useState(false);

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.replace("/");
  };

  const NavItem = ({
    href,
    label,
    icon: Icon,
  }: {
    href: string;
    label: string;
    icon: any;
  }) => (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-2 rounded-md transition ${
        pathname === href
          ? "bg-purple-600 text-white"
          : "text-gray-700 hover:bg-gray-200"
      }`}
      onClick={() => setShowMobile(false)}
    >
      <Icon size={18} />
      {label}
    </Link>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white shadow rounded"
        onClick={() => setShowMobile(!showMobile)}
      >
        <Menu size={22} />
      </button>

      {/* Sidebar container */}
      <aside
        className={`${
          showMobile ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0
        fixed md:static top-0 left-0 h-full w-64 bg-white shadow-lg z-40 
        transition-transform duration-300`}
      >
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-purple-700">SuperAdmin</h1>
        </div>

        {/* Menu Items */}
        <nav className="p-4 flex flex-col gap-1">
          <NavItem href="/superadmin" label="Dashboard" icon={LayoutDashboard} />

          {/* Collapsible Menu */}
          <div>
            <button
              onClick={() => setOpenMenu(!openMenu)}
              className="flex justify-between items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-md"
            >
              <span className="flex items-center gap-3">
                <Users size={18} /> Manage Users
              </span>
              <ChevronDown
                className={`transition ${openMenu ? "rotate-180" : ""}`}
              />
            </button>

            {openMenu && (
              <div className="ml-8 mt-1 flex flex-col gap-1">
                <NavItem
                  href="/superadmin/users/list"
                  label="Users List"
                  icon={Users}
                />
                <NavItem
                  href="/superadmin/users/create"
                  label="Create User"
                  icon={Users}
                />
              </div>
            )}
          </div>

          <NavItem
            href="/superadmin/approvals"
            label="User Approvals"
            icon={CheckCircle}
          />

          <NavItem
            href="/superadmin/support-workbench"
            label="Support Workbench"
            icon={LifeBuoy}
          />

          <NavItem
            href="/superadmin/traffic-test"
            label="Traffic & Load Test"
            icon={Activity}
          />

          <NavItem
            href="/superadmin/settings"
            label="Settings"
            icon={Settings}
          />

          {/* Logout */}
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-2 mt-4 text-red-600 border-t pt-4"
          >
            <LogOut size={18} />
            Logout
          </button>
        </nav>
      </aside>

      {/* Mobile overlay */}
      {showMobile && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={() => setShowMobile(false)}
        />
      )}
    </>
  );
}
