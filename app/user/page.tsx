import MainHeader from "../components/MainHeader";
import AuthGuard from "@/app/components/AuthGuard";

export default function UserPage() {
  return (
    <AuthGuard role="user">
      <>
        <MainHeader />
        <div className="pt-20 flex items-center justify-center">
          <h1 className="text-4xl font-bold">User Dashboard</h1>
        </div>
      </>
    </AuthGuard>
  );
}
