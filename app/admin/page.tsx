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
    console.error("Profile fetch error:", profileError);
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
  } = await supabase.rpc("get_admin_dashboard_stats");

  if (statsError) {
    console.error(
      "Admin dashboard stats error:",
      statsError
    );
  }

  const totalUsers = stats?.total_users ?? 0;
  const totalAuthorities = stats?.total_authorities ?? 0;
  const totalComplaints = stats?.total_complaints ?? 0;

  const submittedCount = stats?.submitted ?? 0;
  const assignedCount = stats?.assigned ?? 0;
  const closedCount = stats?.closed ?? 0;

  const criticalCount = stats?.critical ?? 0;
  const highCount = stats?.high ?? 0;
  const mediumCount = stats?.medium ?? 0;
  const lowCount = stats?.low ?? 0;

  const activeComplaints = Math.max(
    totalComplaints - closedCount,
    0
  );

  const priorityTotal =
    criticalCount +
    highCount +
    mediumCount +
    lowCount;

  const getPercentage = (value: number) => {
    if (!priorityTotal) return 0;
    return Math.round((value / priorityTotal) * 100);
  };

  return (
    <main className="dashboard admin-dashboard">

      <Sidebar activeItem="Dashboard" />

      <div className="dashboard-content">

        {/* =====================================================
            ADMIN HEADER
        ===================================================== */}
        <header className="authority-dashboard-header admin-dashboard-header">

          <div className="authority-welcome">

            <p className="authority-eyebrow">
              JANARAKSHA ADMIN PORTAL
            </p>

            <h1>
              Welcome
            </h1>

            <p className="authority-name">
              {profile.full_name ||
                "System Administrator"}
            </p>

            <p className="authority-description">
              Monitor complaints, authorities and
              platform activity from one centralized
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

              <span>
                Profile
              </span>
            </Link>

          </div>

        </header>


        {/* =====================================================
            PLATFORM METRICS
        ===================================================== */}
        <section className="admin-metrics-grid">

          <Link
            href="/admin/users"
            className="admin-metric-card"
          >
            <div className="admin-metric-top">
              <span>
                TOTAL USERS
              </span>

              <span className="admin-metric-icon">
                ◉
              </span>
            </div>

            <strong>
              {totalUsers}
            </strong>

            <p>
              Registered citizens
            </p>

            <span className="admin-metric-arrow">
              →
            </span>
          </Link>


          <Link
            href="/admin/authorities"
            className="admin-metric-card"
          >
            <div className="admin-metric-top">
              <span>
                AUTHORITIES
              </span>

              <span className="admin-metric-icon">
                ◇
              </span>
            </div>

            <strong>
              {totalAuthorities}
            </strong>

            <p>
              Registered authorities
            </p>

            <span className="admin-metric-arrow">
              →
            </span>
          </Link>


          <Link
            href="/admin/complaints"
            className="admin-metric-card"
          >
            <div className="admin-metric-top">
              <span>
                TOTAL COMPLAINTS
              </span>

              <span className="admin-metric-icon">
                #
              </span>
            </div>

            <strong>
              {totalComplaints}
            </strong>

            <p>
              All submitted cases
            </p>

            <span className="admin-metric-arrow">
              →
            </span>
          </Link>


          <Link
            href="/admin/complaints"
            className="admin-metric-card"
          >
            <div className="admin-metric-top">
              <span>
                ACTIVE CASES
              </span>

              <span className="admin-metric-icon">
                ◌
              </span>
            </div>

            <strong>
              {activeComplaints}
            </strong>

            <p>
              Currently unresolved
            </p>

            <span className="admin-metric-arrow">
              →
            </span>
          </Link>


          <Link
            href="/admin/complaints"
            className="admin-metric-card admin-metric-critical"
          >
            <div className="admin-metric-top">
              <span>
                CRITICAL
              </span>

              <span className="admin-metric-icon">
                !
              </span>
            </div>

            <strong>
              {criticalCount}
            </strong>

            <p>
              Requires immediate attention
            </p>

            <span className="admin-metric-arrow">
              →
            </span>
          </Link>

        </section>


        {/* =====================================================
            MAIN ANALYTICS ROW
        ===================================================== */}
        <section className="admin-overview-grid">

          {/* COMPLAINT STATUS */}
          <div className="admin-panel admin-status-panel">

            <div className="admin-panel-heading">

              <div>
                <p>
                  SYSTEM MONITORING
                </p>

                <h2>
                  Complaint Status
                </h2>
              </div>

              <Link
                href="/admin/complaints"
                className="admin-panel-link"
              >
                View all →
              </Link>

            </div>


            <div className="admin-status-list">

              <div className="admin-status-row">

                <div className="admin-status-label">
                  <span className="admin-status-dot submitted" />
                  <span>Submitted</span>
                </div>

                <strong>
                  {submittedCount}
                </strong>

              </div>


              <div className="admin-status-row">

                <div className="admin-status-label">
                  <span className="admin-status-dot assigned" />
                  <span>Assigned</span>
                </div>

                <strong>
                  {assignedCount}
                </strong>

              </div>


              <div className="admin-status-row">

                <div className="admin-status-label">
                  <span className="admin-status-dot active" />
                  <span>Active</span>
                </div>

                <strong>
                  {activeComplaints}
                </strong>

              </div>


              <div className="admin-status-row">

                <div className="admin-status-label">
                  <span className="admin-status-dot closed" />
                  <span>Closed</span>
                </div>

                <strong>
                  {closedCount}
                </strong>

              </div>

            </div>

          </div>


          {/* PRIORITY */}
          <div className="admin-panel admin-priority-panel">

            <div className="admin-panel-heading">

              <div>
                <p>
                  COMPLAINT MONITORING
                </p>

                <h2>
                  Priority Overview
                </h2>
              </div>

              <span className="admin-total-count">
                {priorityTotal} total
              </span>

            </div>


            <div className="admin-priority-list">

              <div className="admin-priority-row">

                <div className="admin-priority-info">
                  <span className="admin-priority-name">
                    <i className="critical" />
                    Critical
                  </span>

                  <strong>
                    {criticalCount}
                  </strong>
                </div>

                <div className="admin-progress">
                  <span
                    style={{
                      width: `${getPercentage(
                        criticalCount
                      )}%`,
                    }}
                  />
                </div>

              </div>


              <div className="admin-priority-row">

                <div className="admin-priority-info">
                  <span className="admin-priority-name">
                    <i className="high" />
                    High
                  </span>

                  <strong>
                    {highCount}
                  </strong>
                </div>

                <div className="admin-progress">
                  <span
                    style={{
                      width: `${getPercentage(
                        highCount
                      )}%`,
                    }}
                  />
                </div>

              </div>


              <div className="admin-priority-row">

                <div className="admin-priority-info">
                  <span className="admin-priority-name">
                    <i className="medium" />
                    Medium
                  </span>

                  <strong>
                    {mediumCount}
                  </strong>
                </div>

                <div className="admin-progress">
                  <span
                    style={{
                      width: `${getPercentage(
                        mediumCount
                      )}%`,
                    }}
                  />
                </div>

              </div>


              <div className="admin-priority-row">

                <div className="admin-priority-info">
                  <span className="admin-priority-name">
                    <i className="low" />
                    Low
                  </span>

                  <strong>
                    {lowCount}
                  </strong>
                </div>

                <div className="admin-progress">
                  <span
                    style={{
                      width: `${getPercentage(
                        lowCount
                      )}%`,
                    }}
                  />
                </div>

              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            QUICK ACTIONS + SYSTEM SUMMARY
        ===================================================== */}
        <section className="admin-bottom-grid">

          {/* QUICK ACTIONS */}
          <div className="admin-panel admin-actions-panel">

            <div className="admin-panel-heading">

              <div>
                <p>
                  ADMINISTRATION
                </p>

                <h2>
                  Quick Actions
                </h2>
              </div>

            </div>


            <div className="admin-quick-actions">

              <Link
                href="/admin/users"
                className="admin-quick-action"
              >
                <span className="admin-quick-icon">
                  ◉
                </span>

                <span>
                  <strong>
                    Manage Users
                  </strong>

                  <small>
                    View registered citizens
                  </small>
                </span>

                <b>
                  →
                </b>
              </Link>


              <Link
                href="/admin/authorities"
                className="admin-quick-action"
              >
                <span className="admin-quick-icon">
                  ◇
                </span>

                <span>
                  <strong>
                    Manage Authorities
                  </strong>

                  <small>
                    Review authority accounts
                  </small>
                </span>

                <b>
                  →
                </b>
              </Link>


              <Link
                href="/admin/complaints"
                className="admin-quick-action"
              >
                <span className="admin-quick-icon">
                  #
                </span>

                <span>
                  <strong>
                    Review Complaints
                  </strong>

                  <small>
                    Monitor submitted cases
                  </small>
                </span>

                <b>
                  →
                </b>
              </Link>

            </div>

          </div>


          {/* SYSTEM SUMMARY */}
          <div className="admin-panel admin-summary-panel">

            <div className="admin-panel-heading">

              <div>
                <p>
                  PLATFORM HEALTH
                </p>

                <h2>
                  System Summary
                </h2>
              </div>

            </div>


            <div className="admin-summary-content">

              <div className="admin-summary-item">

                <span>
                  Total registered users
                </span>

                <strong>
                  {totalUsers}
                </strong>

              </div>


              <div className="admin-summary-item">

                <span>
                  Active complaints
                </span>

                <strong>
                  {activeComplaints}
                </strong>

              </div>


              <div className="admin-summary-item">

                <span>
                  Successfully closed
                </span>

                <strong>
                  {closedCount}
                </strong>

              </div>


              <div className="admin-summary-item admin-summary-alert">

                <span>
                  Critical complaints
                </span>

                <strong>
                  {criticalCount}
                </strong>

              </div>

            </div>

          </div>

        </section>

      </div>
    </main>
  );
}