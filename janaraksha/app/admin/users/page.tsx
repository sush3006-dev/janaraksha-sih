import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/dashboard/Sidebar";
import AdminUsersTable from "@/components/dashboard/AdminUsersTable";

export default async function AdminUsersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile, error: profileError } =
    await supabase
      .from("profiles")
      .select("full_name, role")
      .eq("id", user.id)
      .single();

  if (profileError || !profile) {
    console.error(
      "Profile fetch error:",
      profileError
    );

    redirect("/auth/login");
  }

  // 🔐 SUPER ADMIN ONLY
  if (profile.role !== "SUPER_ADMIN") {
    if (profile.role === "USER") {
      redirect("/user");
    }

    if (profile.role === "AUTHORITY") {
      redirect("/authority");
    }

    redirect("/auth/login");
  }

  // Get all citizen accounts
  const { data: users, error: usersError } =
    await supabase
      .from("profiles")
      .select(
        "id, full_name, email, account_status, created_at"
      )
      .eq("role", "USER")
      .order("created_at", {
        ascending: false,
      });

  if (usersError) {
    console.error(
      "Users fetch error:",
      usersError
    );
  }

  // Get complaints belonging to citizens
  const {
    data: complaints,
    error: complaintsError,
  } = await supabase
    .from("complaints")
    .select("user_id");

  if (complaintsError) {
    console.error(
      "Complaints fetch error:",
      complaintsError
    );
  }

  // Calculate complaint count for each user
  const complaintCounts = new Map<
    string,
    number
  >();

  complaints?.forEach((complaint) => {
    complaintCounts.set(
      complaint.user_id,
      (complaintCounts.get(
        complaint.user_id
      ) ?? 0) + 1
    );
  });

  // Prepare data for the client table
  const usersWithCounts =
    users?.map((user) => ({
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      account_status: user.account_status,
      created_at: user.created_at,
      complaint_count:
        complaintCounts.get(user.id) ?? 0,
    })) ?? [];

  return (
    <main className="dashboard">
      <Sidebar activeItem="Users" />

      <div className="dashboard-content">

        {/* HEADER */}
        <header className="authority-dashboard-header">
          <div className="authority-welcome">
            <p className="authority-eyebrow">
              JanaRaksha Admin Portal
            </p>

            <h1>Users</h1>

            <p className="authority-description">
              Manage registered citizens and view
              their complaint activity.
            </p>
          </div>

          <div className="authority-header-actions">
            <button
              type="button"
              className="notification-button"
              aria-label="Notifications"
              title="Notifications"
            >
              <span className="notification-icon">
                ♧
              </span>
            </button>

            <Link
              href="/admin/profile"
              className="profile-button"
            >
              <span className="profile-icon">
                ●
              </span>

              <span>Profile</span>
            </Link>
          </div>
        </header>

        {/* USER LIST */}
        <section className="authority-priority-section">

          <div className="authority-section-heading">
            <div>
              <p className="authority-section-eyebrow">
                Account Management
              </p>

              <h2>
                Registered Users
              </h2>
            </div>
          </div>

          <AdminUsersTable
            users={usersWithCounts}
          />

        </section>

      </div>
    </main>
  );
}