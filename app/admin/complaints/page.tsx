import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/dashboard/Sidebar";

export default async function AdminComplaintsPage() {
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

  // SUPER_ADMIN ONLY
  if (profile.role !== "SUPER_ADMIN") {
    if (profile.role === "USER") {
      redirect("/user");
    }

    if (profile.role === "AUTHORITY") {
      redirect("/authority");
    }

    redirect("/auth/login");
  }

  const { data: complaints, error: complaintsError } =
    await supabase
      .from("complaints")
      .select(`
        id,
        complaint_number,
        category,
        description,
        priority,
        status,
        created_at,
        user_id,
        profiles:user_id (
          full_name,
          email
        )
      `)
      .order("created_at", {
        ascending: false,
      });

  if (complaintsError) {
    console.error(
      "Admin complaints fetch error:",
      complaintsError
    );
  }

  return (
    <main className="dashboard">
      <Sidebar activeItem="Complaints" />

      <div className="dashboard-content">
        {/* HEADER */}
        <header className="authority-dashboard-header">
          <div className="authority-welcome">
            <p className="authority-eyebrow">
              JanaRaksha Admin Portal
            </p>

            <h1>Complaints</h1>

            <p className="authority-description">
              Monitor and review all complaints submitted
              through the JanaRaksha platform.
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

        {/* COMPLAINT LIST */}
        <section className="authority-priority-section">
          <div className="authority-section-heading">
            <div>
              <p className="authority-section-eyebrow">
                System Monitoring
              </p>

              <h2>All Complaints</h2>
            </div>

            <span className="admin-list-count">
              {complaints?.length ?? 0}{" "}
              {(complaints?.length ?? 0) === 1
                ? "Complaint"
                : "Complaints"}
            </span>
          </div>

          {complaintsError ? (
            <div className="admin-error-message">
              Unable to load complaints.
            </div>
          ) : complaints && complaints.length > 0 ? (
            <div className="admin-users-table-wrapper">
              <table className="admin-users-table">
                <thead>
                  <tr>
                    <th>Complaint</th>
                    <th>Citizen</th>
                    <th>Category</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {complaints.map((complaint) => {
                    const citizen = Array.isArray(
                      complaint.profiles
                    )
                      ? complaint.profiles[0]
                      : complaint.profiles;

                    return (
                      <tr key={complaint.id}>
                        <td>
                          <strong>
                            {complaint.complaint_number}
                          </strong>
                        </td>

                        <td>
                          <strong>
                            {citizen?.full_name ||
                              "Unnamed User"}
                          </strong>

                          <br />

                          <span>
                            {citizen?.email ||
                              "Email unavailable"}
                          </span>
                        </td>

                        <td>
                          {complaint.category}
                        </td>

                        <td>
                          <span
                            className={`admin-priority-${complaint.priority.toLowerCase()}`}
                          >
                            {complaint.priority}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`admin-complaint-status admin-status-${complaint.status.toLowerCase()}`}
                          >
                            {complaint.status}
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
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="admin-empty-state">
              <h3>No complaints found</h3>

              <p>
                There are no complaints submitted
                on the platform yet.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}