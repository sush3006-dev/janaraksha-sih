import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/dashboard/Sidebar";

export default async function AdminPage() {
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

  // 🔐 Admin-only access
  if (profile.role !== "SUPER_ADMIN") {
    if (profile.role === "USER") {
      redirect("/user");
    }

    if (profile.role === "AUTHORITY") {
      redirect("/authority");
    }

    redirect("/auth/login");
  }

  // Secure system-wide dashboard statistics
  const {
    data: stats,
    error: statsError,
  } = await supabase.rpc(
    "get_admin_dashboard_stats"
  );

  if (statsError) {
    console.error(
      "Admin dashboard stats error:",
      statsError
    );
  }

  const totalUsers =
    stats?.total_users ?? 0;

  const totalAuthorities =
    stats?.total_authorities ?? 0;

  const totalComplaints =
    stats?.total_complaints ?? 0;

  const submittedCount =
    stats?.submitted ?? 0;

  const assignedCount =
    stats?.assigned ?? 0;

  const closedCount =
    stats?.closed ?? 0;

  const criticalCount =
    stats?.critical ?? 0;

  const highCount =
    stats?.high ?? 0;

  const mediumCount =
    stats?.medium ?? 0;

  const lowCount =
    stats?.low ?? 0;

  return (
    <main className="dashboard">
      <Sidebar activeItem="Dashboard" />

      <div className="dashboard-content">

        {/* HEADER */}
        <header className="authority-dashboard-header">
          <div className="authority-welcome">
            <p className="authority-eyebrow">
              JanaRaksha Admin Portal
            </p>

            <h1>Welcome</h1>

            <p className="authority-name">
              {profile.full_name ||
                "System Administrator"}
            </p>

            <p className="authority-description">
              Monitor and manage the JanaRaksha
              platform from one centralized
              workspace.
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

        {/* SYSTEM STATISTICS */}
        <section className="authority-dashboard-cards">

          <Link
            href="/admin/users"
            className="authority-stat-card"
          >
            <span className="authority-stat-label">
              Total Users
            </span>

            <strong>
              {totalUsers}
            </strong>

            <span className="authority-stat-description">
              Registered citizens
            </span>

            <span className="authority-card-arrow">
              →
            </span>
          </Link>

          <Link
            href="/admin/authorities"
            className="authority-stat-card"
          >
            <span className="authority-stat-label">
              Authorities
            </span>

            <strong>
              {totalAuthorities}
            </strong>

            <span className="authority-stat-description">
              Registered authorities
            </span>

            <span className="authority-card-arrow">
              →
            </span>
          </Link>

          <Link
            href="/admin/complaints"
            className="authority-stat-card"
          >
            <span className="authority-stat-label">
              Total Complaints
            </span>

            <strong>
              {totalComplaints}
            </strong>

            <span className="authority-stat-description">
              All submitted cases
            </span>

            <span className="authority-card-arrow">
              →
            </span>
          </Link>

          <Link
            href="/admin/complaints"
            className="authority-stat-card"
          >
            <span className="authority-stat-label">
              Closed Complaints
            </span>

            <strong>
              {closedCount}
            </strong>

            <span className="authority-stat-description">
              Successfully resolved
            </span>

            <span className="authority-card-arrow">
              →
            </span>
          </Link>

        </section>

        {/* COMPLAINT OVERVIEW */}
        <section className="authority-priority-section">

          <div className="authority-section-heading">
            <div>
              <p className="authority-section-eyebrow">
                System Monitoring
              </p>

              <h2>
                Complaint Overview
              </h2>
            </div>
          </div>

          <div className="authority-priority-grid">

            <div className="authority-priority-item">
              <span className="priority-indicator priority-medium" />

              <span className="priority-name">
                Submitted
              </span>

              <strong>
                {submittedCount}
              </strong>
            </div>

            <div className="authority-priority-item">
              <span className="priority-indicator priority-high" />

              <span className="priority-name">
                Assigned
              </span>

              <strong>
                {assignedCount}
              </strong>
            </div>

            <div className="authority-priority-item">
              <span className="priority-indicator priority-low" />

              <span className="priority-name">
                Closed
              </span>

              <strong>
                {closedCount}
              </strong>
            </div>

          </div>
        </section>

        {/* PRIORITY OVERVIEW */}
        <section className="authority-priority-section">

          <div className="authority-section-heading">
            <div>
              <p className="authority-section-eyebrow">
                Complaint Monitoring
              </p>

              <h2>
                Priority Overview
              </h2>
            </div>
          </div>

          <div className="authority-priority-grid">

            <div className="authority-priority-item">
              <span className="priority-indicator priority-critical" />

              <span className="priority-name">
                Critical
              </span>

              <strong>
                {criticalCount}
              </strong>
            </div>

            <div className="authority-priority-item">
              <span className="priority-indicator priority-high" />

              <span className="priority-name">
                High
              </span>

              <strong>
                {highCount}
              </strong>
            </div>

            <div className="authority-priority-item">
              <span className="priority-indicator priority-medium" />

              <span className="priority-name">
                Medium
              </span>

              <strong>
                {mediumCount}
              </strong>
            </div>

            <div className="authority-priority-item">
              <span className="priority-indicator priority-low" />

              <span className="priority-name">
                Low
              </span>

              <strong>
                {lowCount}
              </strong>
            </div>

          </div>
        </section>

      </div>
    </main>
  );
}