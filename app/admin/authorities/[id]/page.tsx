import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/dashboard/Sidebar";

type AuthorityDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminAuthorityDetailsPage({
  params,
}: AuthorityDetailsPageProps) {
  const { id } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Check current user's role
  const { data: adminProfile, error: adminProfileError } =
    await supabase
      .from("profiles")
      .select("full_name, role")
      .eq("id", user.id)
      .single();

  if (adminProfileError || !adminProfile) {
    redirect("/auth/login");
  }

  // SUPER ADMIN ONLY
  if (adminProfile.role !== "SUPER_ADMIN") {
    if (adminProfile.role === "USER") {
      redirect("/user");
    }

    if (adminProfile.role === "AUTHORITY") {
      redirect("/authority");
    }

    redirect("/auth/login");
  }

  // Get authority profile
  const {
    data: authority,
    error: authorityError,
  } = await supabase
    .from("profiles")
    .select(
      "id, full_name, email, phone, role, account_status, created_at, avatar_url"
    )
    .eq("id", id)
    .eq("role", "AUTHORITY")
    .single();

  if (authorityError || !authority) {
    notFound();
  }

  // Get complaints assigned to this authority
  const {
    data: complaints,
    error: complaintsError,
  } = await supabase
    .from("complaints")
    .select(
      "id, complaint_number, category, status, priority, created_at, closed_at"
    )
    .eq("assigned_authority_id", id)
    .order("created_at", {
      ascending: false,
    });

  if (complaintsError) {
    console.error(
      "Authority complaints fetch error:",
      complaintsError
    );
  }

  const assignedCount =
    complaints?.filter(
      (complaint) => complaint.status === "ASSIGNED"
    ).length ?? 0;

  const closedCount =
    complaints?.filter(
      (complaint) => complaint.status === "CLOSED"
    ).length ?? 0;

  const fullName =
    authority.full_name || "Unnamed Authority";

  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((name: string) =>
      name.charAt(0).toUpperCase()
    )
    .join("");

  const memberSince = new Date(
    authority.created_at
  ).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <main className="dashboard">
      <Sidebar activeItem="Authorities" />

      <div className="dashboard-content">
        {/* HEADER */}
        <header className="authority-dashboard-header">
          <div className="authority-welcome">
            <p className="authority-eyebrow">
              JanaRaksha Admin Portal
            </p>

            <h1>Authority Details</h1>

            <p className="authority-description">
              View authority account information and
              complaint activity.
            </p>
          </div>

          <div className="authority-header-actions">
            <Link
              href="/admin/authorities"
              className="admin-view-button"
            >
              ← Back to Authorities
            </Link>

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

        {/* AUTHORITY PROFILE */}
        <section className="profile-hero-card">
          <div className="profile-avatar">
            {authority.avatar_url ? (
              <img
                src={authority.avatar_url}
                alt={`${fullName} profile`}
                className="profile-avatar-image"
              />
            ) : (
              initials
            )}
          </div>

          <div className="profile-hero-info">
            <h2>{fullName}</h2>

            <p className="profile-email">
              ✉ {authority.email || "Not available"}
            </p>

            <div className="profile-hero-meta">
              <span className="profile-account-badge">
                AUTHORITY
              </span>

              <span
                className={
                  authority.account_status === "ACTIVE"
                    ? "profile-verified-badge"
                    : "profile-unverified-badge"
                }
              >
                {authority.account_status === "ACTIVE"
                  ? "Active"
                  : "Inactive"}
              </span>
            </div>

            <p className="profile-member-since">
              ◷ Member since {memberSince}
            </p>
          </div>
        </section>

        {/* ACCOUNT INFORMATION */}
        <section className="profile-section-card">
          <div className="profile-section-header">
            <div>
              <p className="case-section-label">
                ACCOUNT INFORMATION
              </p>

              <h2>Account Information</h2>

              <p>
                Basic details associated with this
                authority account.
              </p>
            </div>
          </div>

          <div className="profile-info-list">
            <div className="profile-info-row">
              <span>Full Name</span>
              <strong>{fullName}</strong>
            </div>

            <div className="profile-info-row">
              <span>Email Address</span>
              <strong>
                {authority.email || "Not available"}
              </strong>
            </div>

   
   
            <div className="profile-info-row">
              <span>Role</span>
              <strong>AUTHORITY</strong>
            </div>

            <div className="profile-info-row">
              <span>Account Status</span>
              <strong
                className={
                  authority.account_status === "ACTIVE"
                    ? "profile-active-status"
                    : "profile-pending-status"
                }
              >
                {authority.account_status === "ACTIVE"
                  ? "Active"
                  : "Inactive"}
              </strong>
            </div>

            <div className="profile-info-row">
              <span>Member Since</span>
              <strong>{memberSince}</strong>
            </div>
          </div>
        </section>

        {/* COMPLAINT SUMMARY */}
        <section className="profile-section-card">
          <div className="profile-section-header">
            <div>
              <p className="case-section-label">
                COMPLAINT ACTIVITY
              </p>

              <h2>Complaint Summary</h2>

              <p>
                Complaint activity assigned to this
                authority.
              </p>
            </div>
          </div>

          <div className="authority-priority-grid">
            <div className="authority-priority-item">
              <span className="priority-indicator priority-high" />

              <span className="priority-name">
                Assigned Complaints
              </span>

              <strong>{assignedCount}</strong>
            </div>

            <div className="authority-priority-item">
              <span className="priority-indicator priority-low" />

              <span className="priority-name">
                Closed Complaints
              </span>

              <strong>{closedCount}</strong>
            </div>

            <div className="authority-priority-item">
              <span className="priority-indicator priority-medium" />

              <span className="priority-name">
                Total Complaints
              </span>

              <strong>{complaints?.length ?? 0}</strong>
            </div>
          </div>
        </section>

        {/* COMPLAINT LIST */}
        <section className="profile-section-card">
          <div className="profile-section-header">
            <div>
              <p className="case-section-label">
                ASSIGNED CASES
              </p>

              <h2>Complaint History</h2>

              <p>
                Complaints currently or previously
                assigned to this authority.
              </p>
            </div>
          </div>

          {complaints && complaints.length > 0 ? (
            <div className="admin-users-table-wrapper">
              <table className="admin-users-table">
                <thead>
                  <tr>
                    <th>Complaint Number</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Submitted</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {complaints.map((complaint) => (
                    <tr key={complaint.id}>
                      <td>
                        <strong>
                          {complaint.complaint_number}
                        </strong>
                      </td>

                      <td>{complaint.category}</td>

                      <td>
                        <span className="admin-status-active">
                          {complaint.status}
                        </span>
                      </td>

                      <td>{complaint.priority}</td>

                      <td>
                        {new Date(
                          complaint.created_at
                        ).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      <td>
                        <Link
                          href={`/admin/complaints/${complaint.id}`}
                          className="admin-view-button"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="admin-empty-state">
              <h3>No complaints assigned</h3>

              <p>
                This authority has no assigned complaints
                yet.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}