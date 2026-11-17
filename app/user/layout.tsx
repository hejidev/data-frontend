import AuthGuard from '@/app/components/AuthGuard';
import { AppSidebar, userNav } from '@/components/dashboard/AppSidebar';
import { MaintenanceBanner } from '@/components/MaintenanceBanner';
import { UserTopbar } from '@/components/UserTopbar';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard role="user">
      <div className="flex min-h-screen bg-muted/30">
        <AppSidebar title="Customer" items={userNav} />
        <div className="min-w-0 flex-1">
          <MaintenanceBanner />
          <UserTopbar />
          <main className="p-4 md:p-8">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}