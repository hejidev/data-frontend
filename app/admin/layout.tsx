import AuthGuard from '@/app/components/AuthGuard';
import { AppSidebar, adminNav } from '@/components/dashboard/AppSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard role="admin">
      <div className="flex min-h-screen bg-muted/30">
        <AppSidebar title="Admin" items={adminNav} />
        <main className="flex-1 p-4 pt-16 md:p-8 md:pt-8">{children}</main>
      </div>
    </AuthGuard>
  );
}
