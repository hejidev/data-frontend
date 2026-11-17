import AuthGuard from '@/app/components/AuthGuard';
import { AppSidebar, superNav } from '@/components/dashboard/AppSidebar';

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard role="superadmin">
      <div className="flex min-h-screen bg-muted/30">
        <AppSidebar title="Superadmin" items={superNav} />
        <main className="flex-1 p-4 pt-16 md:p-8 md:pt-8">{children}</main>
      </div>
    </AuthGuard>
  );
}
