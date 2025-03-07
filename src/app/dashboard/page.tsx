import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import BrandRegistrationForm from "@/components/forms/BrandRegistrationForm";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) return redirect("/login");

  return (
    <div className="p-6 flex justify-center items-center h-full">
      <h1>Hello {session.user.name}, Welcome to Admin Dashboard</h1>
    </div>
  );
}
