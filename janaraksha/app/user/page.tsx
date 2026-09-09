import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/dashboard/Sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

export default async function UserDashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    redirect("/auth/login");
  }

  if (profile.role !== "USER") {
    if (profile.role === "AUTHORITY") {
      redirect("/authority");
    }

    if (profile.role === "SUPER_ADMIN") {
      redirect("/admin");
    }

    redirect("/auth/login");
  }

  return (
    <main className="dashboard">
      <Sidebar activeItem="Dashboard" />

      <section className="dashboard-content">
        <DashboardHeader
          title="User Dashboard"
          description="Welcome back to JanaRaksha."
        />

        <section className="welcome-card">
          <div>
            <p className="card-label">
              WELCOME TO JANARAKSHA
            </p>

            <h2>Your voice matters.</h2>

            <p>
              Register complaints, track their progress,
              and get assistance whenever you need it.
            </p>
          </div>
        </section>
      </section>
    </main>
  );
}