import Link from "next/link";
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

  const { data: profile, error: profileError } =
    await supabase
      .from("profiles")
      .select("role, full_name, email")
      .eq("id", user.id)
      .single();

  if (profileError || !profile) {
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

  const { data: complaints, error: complaintsError } =
    await supabase
      .from("complaints")
      .select(
        "id, complaint_number, category, status, priority, created_at"
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

  if (complaintsError) {
    console.error(
      "Dashboard complaints error:",
      complaintsError
    );
  }

  const userComplaints = complaints ?? [];

  const totalComplaints = userComplaints.length;

  const submittedComplaints = userComplaints.filter(
    (complaint) => complaint.status === "SUBMITTED"
  ).length;

  const assignedComplaints = userComplaints.filter(
    (complaint) => complaint.status === "ASSIGNED"
  ).length;

  const recentComplaints = userComplaints.slice(0, 3);

  const displayName =
    profile.full_name?.trim() ||
    user.email?.split("@")[0] ||
    "Citizen";

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <main className="dashboard">
      <Sidebar activeItem="Dashboard" />

      <section className="dashboard-content user-dashboard-page">
        <DashboardHeader
          title="User Dashboard"
          description={`Welcome back, ${displayName}.`}
        />

        {/* Welcome */}
        <section className="user-dashboard-welcome">
          <div className="user-dashboard-welcome-content">
            <p className="card-label">
              CITIZEN PORTAL
            </p>

            <h2>
              Your voice matters, {displayName}.
            </h2>

            <p>
              Report incidents, keep track of your
              complaints, and stay informed about their
              progress through JanaRaksha.
            </p>
          </div>

          
        </section>

        {/* Complaint Overview */}
        <section className="user-dashboard-section">
          <div className="user-dashboard-section-heading">
            <div>
              <p className="dashboard-section-label">
                OVERVIEW
              </p>

              <h2>Your Complaints</h2>

              <p>
                A quick overview of your submitted
                complaints.
              </p>
            </div>
          </div>

          <div className="user-dashboard-stat-grid">
            <Link
              href="/user/complaints"
              className="user-dashboard-stat-card"
            >
              <div className="stat-card-top">
                <span className="stat-card-icon">
                  ◫
                </span>
              </div>

              <strong>{totalComplaints}</strong>

              <span>Total Complaints</span>
            </Link>

            <Link
              href="/user/complaints"
              className="user-dashboard-stat-card"
            >
              <div className="stat-card-top">
                <span className="stat-card-icon">
                  ◷
                </span>
              </div>

              <strong>{submittedComplaints}</strong>

              <span>Submitted</span>
            </Link>

            <Link
              href="/user/track"
              className="user-dashboard-stat-card"
            >
              <div className="stat-card-top">
                <span className="stat-card-icon">
                  ✓
                </span>
              </div>

              <strong>{assignedComplaints}</strong>

              <span>Assigned</span>
            </Link>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="user-dashboard-section">
          <div className="user-dashboard-section-heading">
            <div>
              <p className="dashboard-section-label">
                QUICK ACTIONS
              </p>

              <h2>What would you like to do?</h2>
            </div>
          </div>

          <div className="user-dashboard-actions">
            <Link
              href="/user/register-complaint"
              className="user-dashboard-action-card primary-action"
            >
              <div className="action-card-icon">
                +
              </div>

              <div>
                <strong>Register Complaint</strong>

                <p>
                  Report an incident and submit your
                  complaint securely.
                </p>
              </div>

              <span className="action-arrow">→</span>
            </Link>

            <Link
              href="/user/complaints"
              className="user-dashboard-action-card"
            >
              <div className="action-card-icon">
                ◫
              </div>

              <div>
                <strong>My Complaints</strong>

                <p>
                  View the complaints you have already
                  submitted.
                </p>
              </div>

              <span className="action-arrow">→</span>
            </Link>

            <Link
              href="/user/track"
              className="user-dashboard-action-card"
            >
              <div className="action-card-icon">
                ◷
              </div>

              <div>
                <strong>Track Complaint</strong>

                <p>
                  Check the current status of your
                  complaint.
                </p>
              </div>

              <span className="action-arrow">→</span>
            </Link>

            <Link
              href="/user/ai-support"
              className="user-dashboard-action-card"
            >
              <div className="action-card-icon">
                ✦
              </div>

              <div>
                <strong>AI Support</strong>

                <p>
                  Get assistance and guidance through
                  JanaRaksha AI.
                </p>
              </div>

              <span className="action-arrow">→</span>
            </Link>
          </div>
        </section>

        {/* Recent Complaints */}
        <section className="user-dashboard-section">
          <div className="user-dashboard-section-heading recent-heading">
            <div>
              <p className="dashboard-section-label">
                ACTIVITY
              </p>

              <h2>Recent Complaints</h2>

              <p>
                Your latest submitted complaints.
              </p>
            </div>

            {totalComplaints > 0 && (
              <Link
                href="/user/complaints"
                className="dashboard-view-all"
              >
                View All →
              </Link>
            )}
          </div>

          {recentComplaints.length > 0 ? (
            <div className="user-dashboard-recent-list">
              {recentComplaints.map((complaint) => (
                <div
                  key={complaint.id}
                  className="user-dashboard-complaint-row"
                >
                  <div className="complaint-row-main">
                    <span className="complaint-row-number">
                      {complaint.complaint_number}
                    </span>

                    <h3>{complaint.category}</h3>

                    <p>
                      Submitted{" "}
                      {formatDate(
                        complaint.created_at
                      )}
                    </p>
                  </div>

                  <div className="complaint-row-meta">
                    <span
                      className={`dashboard-status-badge status-${complaint.status.toLowerCase()}`}
                    >
                      {complaint.status}
                    </span>

                    <span
                      className={`dashboard-priority-badge priority-${complaint.priority.toLowerCase()}`}
                    >
                      {complaint.priority}
                    </span>
                  </div>

                  <Link
                    href="/user/track"
                    className="complaint-row-action"
                  >
                    Track →
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="user-dashboard-empty">
              <div className="empty-state-icon">
                ◫
              </div>

              <h3>No complaints yet</h3>

              <p>
                You have not submitted any complaints.
                Your registered complaints will appear
                here.
              </p>

              <Link
                href="/user/register-complaint"
                className="primary-dashboard-button"
              >
                Register Your First Complaint
              </Link>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}