import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/dashboard/Sidebar";

export default async function AuthorityPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    console.error("Profile fetch error:", profileError);
    redirect("/auth/login");
  }

  // Authority-only access
  if (profile.role !== "AUTHORITY") {
    if (profile.role === "USER") {
      redirect("/user");
    }

    if (profile.role === "SUPER_ADMIN") {
      redirect("/admin");
    }

    redirect("/auth/login");
  }

  /*
   * IMPORTANT SECURITY FILTER:
   *
   * Only complaints assigned to the currently logged-in
   * authority will be fetched.
   *
   * Example:
   * Robert can only see complaints where
   * assigned_authority_id equals Robert's user.id.
   */
  const {
    data: complaints,
    error: complaintsError,
  } = await supabase
    .from("complaints")
    .select("status, priority")
    .eq("assigned_authority_id", user.id);

  if (complaintsError) {
    console.error("Complaints fetch error:", complaintsError);
  }

  const assignedComplaints = complaints ?? [];

  const submittedCount = assignedComplaints.filter(
    (complaint) => complaint.status === "SUBMITTED"
  ).length;

  const assignedCount = assignedComplaints.filter(
    (complaint) =>
      complaint.status === "ASSIGNED" ||
      complaint.status === "IN_PROGRESS" ||
      complaint.status === "REOPENED"
  ).length;

  const doneCount = assignedComplaints.filter(
    (complaint) =>
      complaint.status === "DONE" ||
      complaint.status === "UNDER_VERIFICATION"
  ).length;

  const closedCount = assignedComplaints.filter(
    (complaint) => complaint.status === "CLOSED"
  ).length;

  const criticalCount = assignedComplaints.filter(
    (complaint) => complaint.priority === "CRITICAL"
  ).length;

  const highCount = assignedComplaints.filter(
    (complaint) => complaint.priority === "HIGH"
  ).length;

  const mediumCount = assignedComplaints.filter(
    (complaint) => complaint.priority === "MEDIUM"
  ).length;

  const lowCount = assignedComplaints.filter(
    (complaint) => complaint.priority === "LOW"
  ).length;

  return (
    <main className="dashboard">
      <Sidebar activeItem="Dashboard" />

      <div className="dashboard-content">
        <header className="authority-dashboard-header">
          <div className="authority-welcome">
            <p className="authority-eyebrow">
              JanaRaksha Authority Portal
            </p>

            <h1>Welcome</h1>

            <p className="authority-name">
              {profile.full_name || "Authority Officer"}
            </p>

            <p className="authority-description">
              Review, manage, and monitor citizen complaints assigned
              specifically to you.
            </p>
          </div>

          <div className="authority-header-actions">
            <button
              type="button"
              className="notification-button"
              aria-label="Notifications"
              title="Notifications"
            >
              <span className="notification-icon">♧</span>
            </button>

            <Link
              href="/authority/profile"
              className="profile-button"
            >
              <span className="profile-icon">●</span>
              <span>Profile</span>
            </Link>
          </div>
        </header>

        <section className="authority-dashboard-cards">
          <Link
            href="/authority/complaints"
            className="authority-stat-card"
          >
            <span className="authority-stat-label">
              New Complaints
            </span>

            <strong>{submittedCount}</strong>

            <span className="authority-stat-description">
              Submitted complaints assigned to you
            </span>

            <span className="authority-card-arrow">→</span>
          </Link>

          <Link
            href="/authority/assigned-complaints"
            className="authority-stat-card"
          >
            <span className="authority-stat-label">
              Assigned Complaints
            </span>

            <strong>{assignedCount}</strong>

            <span className="authority-stat-description">
              Assigned, in progress, or reopened
            </span>

            <span className="authority-card-arrow">→</span>
          </Link>

          <Link
            href="/authority/closed-complaints"
            className="authority-stat-card"
          >
            <span className="authority-stat-label">
              Closed Complaints
            </span>

            <strong>{closedCount}</strong>

            <span className="authority-stat-description">
              Successfully closed complaints
            </span>

            <span className="authority-card-arrow">→</span>
          </Link>
        </section>

        <section className="authority-priority-section">
          <div className="authority-section-heading">
            <div>
              <p className="authority-section-eyebrow">
                Complaint Monitoring
              </p>

              <h2>Priority Overview</h2>
            </div>
          </div>

          <div className="authority-priority-grid">
            <div className="authority-priority-item">
              <span className="priority-indicator priority-critical" />

              <span className="priority-name">Critical</span>

              <strong>{criticalCount}</strong>
            </div>

            <div className="authority-priority-item">
              <span className="priority-indicator priority-high" />

              <span className="priority-name">High</span>

              <strong>{highCount}</strong>
            </div>

            <div className="authority-priority-item">
              <span className="priority-indicator priority-medium" />

              <span className="priority-name">Medium</span>

              <strong>{mediumCount}</strong>
            </div>

            <div className="authority-priority-item">
              <span className="priority-indicator priority-low" />

              <span className="priority-name">Low</span>

              <strong>{lowCount}</strong>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}