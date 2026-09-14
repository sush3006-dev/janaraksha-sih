import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/dashboard/Sidebar";

export default async function AdminAssignmentsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!adminProfile || adminProfile.role !== "SUPER_ADMIN") {
    if (adminProfile?.role === "USER") {
      redirect("/user");
    }

    if (adminProfile?.role === "AUTHORITY") {
      redirect("/authority");
    }

    redirect("/auth/login");
  }

  const { data: complaints, error } = await supabase
    .from("complaints")
    .select(`
      id,
      complaint_number,
      category,
      status,
      priority,
      created_at,
      updated_at,
      assigned_authority_id,
      user_id
    `)
    .not("assigned_authority_id", "is", null)
    .order("updated_at", {
      ascending: false,
    });

  if (error) {
    console.error("Assignments fetch error:", error);
  }

  const complaintRows = complaints ?? [];

  const userIds = [
    ...new Set(
      complaintRows
        .map((complaint) => complaint.user_id)
        .filter(Boolean),
    ),
  ];

  const authorityIds = [
    ...new Set(
      complaintRows
        .map((complaint) => complaint.assigned_authority_id)
        .filter(Boolean),
    ),
  ];

  const profileIds = [
    ...new Set([...userIds, ...authorityIds]),
  ];

  const { data: profiles, error: profilesError } =
    profileIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, full_name, email")
          .in("id", profileIds)
      : { data: [], error: null };

  if (profilesError) {
    console.error(
      "Assignments profiles fetch error:",
      profilesError,
    );
  }

  const profileMap = new Map(
    (profiles ?? []).map((profile) => [
      profile.id,
      profile,
    ]),
  );

  return (
    <main className="dashboard">
      <Sidebar activeItem="Assignments" />

      <div className="dashboard-content">
        <header className="authority-dashboard-header">
          <div className="authority-welcome">
            <p className="authority-eyebrow">
              JanaRaksha Admin Portal
            </p>

            <h1>Assignments</h1>

            <p className="authority-description">
              View complaints assigned to authorities and monitor
              their current status.
            </p>
          </div>

          <div className="authority-header-actions">
            <Link
              href="/admin"
              className="admin-view-button"
            >
              ← Back to Dashboard
            </Link>

            <Link
              href="/admin/profile"
              className="profile-button"
            >
              <span className="profile-icon">●</span>
              <span>Profile</span>
            </Link>
          </div>
        </header>

        <section className="profile-section-card">
          <div className="profile-section-header">
            <div>
              <p className="case-section-label">
                ASSIGNMENT MANAGEMENT
              </p>

              <h2>Assigned Complaints</h2>

              <p>
                Complaints currently assigned to authorities.
              </p>
            </div>
          </div>

          {complaintRows.length > 0 ? (
            <div
              className="admin-users-table-wrapper"
              style={{
                width: "100%",
                overflowX: "auto",
              }}
            >
              <table
                className="admin-users-table"
                style={{
                  width: "100%",
                  minWidth: "1180px",
                  tableLayout: "fixed",
                  borderCollapse: "collapse",
                }}
              >
                <colgroup>
                  <col style={{ width: "180px" }} />
                  <col style={{ width: "210px" }} />
                  <col style={{ width: "125px" }} />
                  <col style={{ width: "210px" }} />
                  <col style={{ width: "105px" }} />
                  <col style={{ width: "125px" }} />
                  <col style={{ width: "125px" }} />
                  <col style={{ width: "90px" }} />
                </colgroup>

                <thead>
                  <tr>
                    <th>Complaint Number</th>
                    <th>Citizen</th>
                    <th>Category</th>
                    <th>Authority</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {complaintRows.map((complaint) => {
                    const citizen = profileMap.get(
                      complaint.user_id,
                    );

                    const authority = complaint.assigned_authority_id
                      ? profileMap.get(
                          complaint.assigned_authority_id,
                        )
                      : null;

                    return (
                      <tr key={complaint.id}>
                        {/* Complaint Number */}
                        <td>
                          <span
                            style={{
                              display: "block",
                              fontSize: "13px",
                              fontWeight: 700,
                              lineHeight: 1.4,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {complaint.complaint_number}
                          </span>
                        </td>

                        {/* Citizen */}
                        <td>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "center",
                              gap: "3px",
                              minWidth: 0,
                              minHeight: "52px",
                            }}
                          >
                            <strong
                              style={{
                                display: "block",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                fontSize: "13px",
                                fontWeight: 700,
                                lineHeight: 1.4,
                              }}
                              title={
                                citizen?.full_name ||
                                "Unknown Citizen"
                              }
                            >
                              {citizen?.full_name ||
                                "Unknown Citizen"}
                            </strong>

                            <span
                              style={{
                                display: "block",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                fontSize: "12px",
                                lineHeight: 1.4,
                                color: "var(--jr-muted)",
                              }}
                              title={
                                citizen?.email ||
                                "No email available"
                              }
                            >
                              {citizen?.email ||
                                "No email available"}
                            </span>
                          </div>
                        </td>

                        {/* Category */}
                        <td>
                          <span
                            style={{
                              display: "block",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              fontSize: "13px",
                              lineHeight: 1.4,
                            }}
                            title={complaint.category}
                          >
                            {complaint.category}
                          </span>
                        </td>

                        {/* Authority */}
                        <td>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              justifyContent: "center",
                              gap: "3px",
                              minWidth: 0,
                              minHeight: "52px",
                            }}
                          >
                            <strong
                              style={{
                                display: "block",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                fontSize: "13px",
                                fontWeight: 700,
                                lineHeight: 1.4,
                              }}
                              title={
                                authority?.full_name ||
                                "Unknown Authority"
                              }
                            >
                              {authority?.full_name ||
                                "Unknown Authority"}
                            </strong>

                            <span
                              style={{
                                display: "block",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                fontSize: "12px",
                                lineHeight: 1.4,
                                color: "var(--jr-muted)",
                              }}
                              title={
                                authority?.email ||
                                "No email available"
                              }
                            >
                              {authority?.email ||
                                "No email available"}
                            </span>
                          </div>
                        </td>

                        {/* Priority */}
                        <td>
                          <span
                            className={`case-priority-badge priority-${complaint.priority.toLowerCase()}`}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              minWidth: "82px",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {complaint.priority}
                          </span>
                        </td>

                        {/* Status */}
                        <td>
                          <span
                            className={`case-status-badge status-${complaint.status.toLowerCase()}`}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              whiteSpace: "nowrap",
                            }}
                          >
                            <span className="case-status-dot" />
                            {complaint.status}
                          </span>
                        </td>

                        {/* Submitted */}
                        <td>
                          <span
                            style={{
                              display: "block",
                              fontSize: "13px",
                              whiteSpace: "nowrap",
                              lineHeight: 1.4,
                            }}
                          >
                            {new Date(
                              complaint.created_at,
                            ).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </td>

                        {/* Action */}
                        <td>
                          <Link
                            href={`/admin/complaints/${complaint.id}`}
                            className="admin-view-button"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              minWidth: "64px",
                              padding: "8px 12px",
                              whiteSpace: "nowrap",
                            }}
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
              <h3>No assigned complaints</h3>

              <p>
                No complaints have been assigned to authorities yet.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}