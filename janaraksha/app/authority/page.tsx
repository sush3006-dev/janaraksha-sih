import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/dashboard/Sidebar";

export default async function AuthorityPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <p>You must be logged in.</p>;
  }

  const { data: profile, error: profileError } =
    await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

  if (profileError) {
    console.error("Profile fetch error:", profileError);
  }

  const { data: complaints, error: complaintsError } =
    await supabase
      .from("complaints")
      .select("status, priority");

  if (complaintsError) {
    console.error(
      "Complaints fetch error:",
      complaintsError
    );
  }

  const submittedCount =
    complaints?.filter(
      (complaint) =>
        complaint.status === "SUBMITTED"
    ).length ?? 0;

  const assignedCount =
    complaints?.filter(
      (complaint) =>
        complaint.status === "ASSIGNED"
    ).length ?? 0;

  const closedCount =
    complaints?.filter(
      (complaint) =>
        complaint.status === "CLOSED"
    ).length ?? 0;

  const criticalCount =
    complaints?.filter(
      (complaint) =>
        complaint.priority === "CRITICAL"
    ).length ?? 0;

  const highCount =
    complaints?.filter(
      (complaint) =>
        complaint.priority === "HIGH"
    ).length ?? 0;

  const mediumCount =
    complaints?.filter(
      (complaint) =>
        complaint.priority === "MEDIUM"
    ).length ?? 0;

  const lowCount =
    complaints?.filter(
      (complaint) =>
        complaint.priority === "LOW"
    ).length ?? 0;

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
              {profile?.full_name ||
                "Authority Officer"}
            </p>

            <p className="authority-description">
              Review, manage, and monitor citizen
              complaints from one centralized
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
              href="/authority/profile"
              className="profile-button"
            >
              <span className="profile-icon">
                ●
              </span>

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
              Complaints
            </span>

            <strong>{submittedCount}</strong>

            <span className="authority-stat-description">
              Submitted complaints
            </span>

            <span className="authority-card-arrow">
              →
            </span>
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
              Currently assigned
            </span>

            <span className="authority-card-arrow">
              →
            </span>
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
              Successfully closed
            </span>

            <span className="authority-card-arrow">
              →
            </span>
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

              <span className="priority-name">
                Critical
              </span>

              <strong>{criticalCount}</strong>
            </div>

            <div className="authority-priority-item">
              <span className="priority-indicator priority-high" />

              <span className="priority-name">
                High
              </span>

              <strong>{highCount}</strong>
            </div>

            <div className="authority-priority-item">
              <span className="priority-indicator priority-medium" />

              <span className="priority-name">
                Medium
              </span>

              <strong>{mediumCount}</strong>
            </div>

            <div className="authority-priority-item">
              <span className="priority-indicator priority-low" />

              <span className="priority-name">
                Low
              </span>

              <strong>{lowCount}</strong>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}