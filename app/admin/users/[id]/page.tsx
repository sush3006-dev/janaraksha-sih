import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/dashboard/Sidebar";
import AdminUserStatusButton from "@/components/dashboard/AdminUserStatusButton";

type AdminUserDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminUserDetailsPage({
  params,
}: AdminUserDetailsPageProps) {
  const { id } = await params;

  const supabase = await createClient();

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  if (!currentUser) {
    redirect("/auth/login");
  }

  // Check admin profile
  const { data: adminProfile, error: adminError } =
    await supabase
      .from("profiles")
      .select("full_name, role")
      .eq("id", currentUser.id)
      .single();

  if (adminError || !adminProfile) {
    console.error(
      "Admin profile fetch error:",
      adminError
    );

    redirect("/auth/login");
  }

  // 🔐 SUPER ADMIN ONLY
  if (adminProfile.role !== "SUPER_ADMIN") {
    if (adminProfile.role === "USER") {
      redirect("/user");
    }

    if (adminProfile.role === "AUTHORITY") {
      redirect("/authority");
    }

    redirect("/auth/login");
  }

  // Get selected citizen
  const { data: selectedUser, error: userError } =
    await supabase
      .from("profiles")
      .select(
        "id, full_name, email, role, account_status, created_at"
      )
      .eq("id", id)
      .eq("role", "USER")
      .single();

  if (userError || !selectedUser) {
    console.error(
      "User fetch error:",
      userError
    );

    notFound();
  }

  // Get user's complaints
  const {
    data: complaints,
    error: complaintsError,
  } = await supabase
    .from("complaints")
    .select(
      "id, complaint_number, category, priority, status, created_at"
    )
    .eq("user_id", id)
    .order("created_at", {
      ascending: false,
    });

  if (complaintsError) {
    console.error(
      "User complaints fetch error:",
      complaintsError
    );
  }

  const fullName =
    selectedUser.full_name || "Unnamed User";

  const email =
    selectedUser.email || "Not available";

  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((name: string) =>
      name.charAt(0).toUpperCase()
    )
    .join("");

  const memberSince = new Date(
    selectedUser.created_at
  ).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const complaintCount =
    complaints?.length ?? 0;

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

            <h1>User Details</h1>

            <p className="authority-description">
              View citizen account information and
              complaint activity.
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

        {/* BACK */}
        <Link
          href="/admin/users"
          className="admin-back-link"
        >
          ← Back to Users
        </Link>

        {/* USER PROFILE */}
        <section className="admin-user-profile-card">

          <div className="admin-user-profile-main">

            <div className="admin-user-avatar">
              {initials || "U"}
            </div>

            <div>
              <p className="authority-section-eyebrow">
                CITIZEN ACCOUNT
              </p>

              <h2>{fullName}</h2>

              <p className="admin-user-email">
                {email}
              </p>

              <div className="admin-user-meta">
                <span className="admin-account-type">
                  Citizen
                </span>

                <span
                  className={
                    selectedUser.account_status ===
                    "ACTIVE"
                      ? "admin-status-active"
                      : "admin-status-inactive"
                  }
                >
                  {selectedUser.account_status ===
                  "ACTIVE"
                    ? "Active"
                    : "Inactive"}
                </span>
              </div>
            </div>

          </div>

          <AdminUserStatusButton
            userId={selectedUser.id}
            currentStatus={
              selectedUser.account_status
            }
          />

        </section>

        {/* ACCOUNT INFORMATION */}
        <section className="authority-priority-section">

          <div className="authority-section-heading">
            <div>
              <p className="authority-section-eyebrow">
                ACCOUNT INFORMATION
              </p>

              <h2>
                Account Information
              </h2>
            </div>
          </div>

          <div className="admin-user-info-grid">

            <div className="admin-user-info-item">
              <span>Full Name</span>

              <strong>{fullName}</strong>
            </div>

            <div className="admin-user-info-item">
              <span>Email Address</span>

              <strong>{email}</strong>
            </div>

            <div className="admin-user-info-item">
              <span>Account Type</span>

              <strong>Citizen</strong>
            </div>

            <div className="admin-user-info-item">
              <span>Member Since</span>

              <strong>{memberSince}</strong>
            </div>

          </div>

        </section>

        {/* COMPLAINT ACTIVITY */}
        <section className="authority-priority-section">

          <div className="authority-section-heading">
            <div>
              <p className="authority-section-eyebrow">
                COMPLAINT ACTIVITY
              </p>

              <h2>
                User Complaints
              </h2>
            </div>

            <span className="admin-list-count">
              {complaintCount}{" "}
              {complaintCount === 1
                ? "Complaint"
                : "Complaints"}
            </span>
          </div>

          {complaints &&
          complaints.length > 0 ? (
            <div className="admin-users-table-wrapper">
              <table className="admin-users-table">
                <thead>
                  <tr>
                    <th>
                      Complaint
                    </th>

                    <th>
                      Category
                    </th>

                    <th>
                      Priority
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Submitted
                    </th>

                    <th>
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {complaints.map(
                    (complaint) => (
                      <tr
                        key={complaint.id}
                      >
                        <td>
                          <strong>
                            {
                              complaint.complaint_number
                            }
                          </strong>
                        </td>

                        <td>
                          {
                            complaint.category
                          }
                        </td>

                        <td>
                          <span
                            className={`admin-priority-badge admin-priority-${complaint.priority.toLowerCase()}`}
                          >
                            {
                              complaint.priority
                            }
                          </span>
                        </td>

                        <td>
                          <span
                            className={`admin-complaint-status admin-complaint-status-${complaint.status.toLowerCase()}`}
                          >
                            {
                              complaint.status
                            }
                          </span>
                        </td>

                        <td>
                          {new Date(
                            complaint.created_at
                          ).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )}
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
                    )
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="admin-empty-state">
              <h3>
                No complaints
              </h3>

              <p>
                This citizen has not submitted
                any complaints.
              </p>
            </div>
          )}

        </section>

      </div>
    </main>
  );
}