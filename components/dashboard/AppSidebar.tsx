'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  Activity, BarChart3, BookOpen, CheckCircle, CreditCard, FileText, Gift, HelpCircle,
  LayoutDashboard, LifeBuoy, ListOrdered, LogOut, Mail, Menu, Newspaper, Package, Plug,
  ScrollText, Settings, ShieldCheck, ShoppingBag, UserCircle, Users, Wallet, Wifi,
} from 'lucide-react';
import { useLogout } from '@/hooks/useAuth';
import { useSite } from '@/hooks/useSite';

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
};

export function AppSidebar({
  title,
  items,
}: {
  title: string;
  items: NavItem[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useLogout();
  const [mobile, setMobile] = useState(false);
  const site = useSite();

  async function onLogout() {
    await logout.mutateAsync();
    router.replace('/');
  }

  return (
    <>
      <button
        className="fixed left-4 top-4 z-50 rounded-lg bg-card p-2 shadow md:hidden"
        onClick={() => setMobile((v) => !v)}
      >
        <Menu size={20} />
      </button>

      <aside
        className={`${mobile ? 'translate-x-0' : '-translate-x-full'
          } fixed inset-y-0 left-0 z-40 w-64 border-r border-slate-200 bg-card transition md:sticky md:top-0 md:h-screen md:overflow-y-auto md:translate-x-0`}
      >
        <div className="flex items-center gap-2 border-b px-5 py-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0f766e] text-white">
            <Wifi size={16} />
          </span>
          <div>
            <div className="font-[family-name:var(--font-display)] text-lg font-bold text-foreground">
              {site.siteName}
            </div>
            <div className="text-xs text-slate-500">{title}</div>
          </div>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {items.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href ||
              (pathname.startsWith(`${item.href}/`) &&
                !items.some(
                  (o) => o.href.length > item.href.length && (pathname === o.href || pathname.startsWith(`${o.href}/`))
                ));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobile(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm ${active
                  ? 'bg-[#0f766e] text-white'
                  : 'text-foreground/80 hover:bg-accent'
                  }`}
              >
                <Icon size={17} />
                {item.label}
              </Link>
            );
          })}
          <button
            onClick={onLogout}
            className="mt-3 flex items-center gap-3 rounded-xl border-t px-3 py-3 text-sm text-red-600"
          >
            <LogOut size={17} />
            Logout
          </button>
        </nav>
      </aside>

      {mobile && (
        <div
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
          onClick={() => setMobile(false)}
        />
      )}
    </>
  );
}
export const userNav: NavItem[] = [
  { href: '/user/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/user/buy-data', label: 'Buy Data', icon: ShoppingBag },
  { href: '/user/buy-airtime', label: 'Buy Airtime', icon: CreditCard },
  { href: '/user/wallet', label: 'Wallet', icon: Wallet },
  { href: '/user/orders', label: 'Orders', icon: ListOrdered },
  { href: '/user/referrals', label: 'Refer & earn', icon: Gift },
  { href: '/user/support', label: 'Support', icon: LifeBuoy },
  { href: '/user/security', label: 'Security', icon: ShieldCheck },
  { href: '/user/profile', label: 'Profile', icon: UserCircle },
];

export const adminNav: NavItem[] = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'Orders', icon: Package },
  { href: '/admin/plans', label: 'Plans', icon: ShoppingBag },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/ledger', label: 'Ledger', icon: BookOpen },
  { href: '/admin/tickets', label: 'Tickets', icon: LifeBuoy },
  { href: '/admin/blog', label: 'Blog', icon: Newspaper },
  { href: '/admin/faqs', label: 'FAQs', icon: HelpCircle },
  { href: '/admin/messages', label: 'Messages', icon: Mail },
  { href: '/admin/settings', label: 'Branding', icon: Settings },
];

export const superNav: NavItem[] = [
  { href: '/superadmin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/superadmin/reports', label: 'Reports', icon: BarChart3 },
  { href: '/superadmin/users/list', label: 'Users List', icon: Users },
  { href: '/superadmin/users/create', label: 'Create User', icon: Users },
  { href: '/superadmin/approvals', label: 'Signups', icon: CheckCircle },
  { href: '/superadmin/provider', label: 'VTU provider', icon: Plug },
  { href: '/admin/ledger', label: 'Ledger', icon: BookOpen },
  { href: '/superadmin/audit', label: 'Audit log', icon: ScrollText },
  { href: '/superadmin/support-workbench', label: 'Support Workbench', icon: LifeBuoy },
  { href: '/superadmin/legal', label: 'Legal pages', icon: FileText },
  { href: '/superadmin/traffic-test', label: 'Traffic & Load Test', icon: Activity },
  { href: '/superadmin/settings', label: 'Settings', icon: Settings },
  { href: '/admin/blog', label: 'Blog', icon: Newspaper },
  { href: '/admin/faqs', label: 'FAQs', icon: HelpCircle },
  { href: '/admin/messages', label: 'Messages', icon: Mail },
  { href: '/admin/settings', label: 'Branding', icon: Settings },
];