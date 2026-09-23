import Link from "next/link";
import { redirect } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import { createClient } from "@/lib/supabase/server";

export default async function AssignedComplaintsPage() {
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

  if (profileError || !profile || profile.role !== "AUTHORITY") {
    redirect("/auth/login");
  }

  const { data: complaints, error } = await supabase
    .from("complaints")
    .select(
      `
        id,
        complaint_number,
        category,
        description,
        priority,
        status,
        created_at,
        assigned_authority_id
      `
    )
    .eq("assigned_authority_id", user.id)
    .eq("status", "ASSIGNED")
    .order("created_at", { ascending: false });

  return (
    <main className="dashboard">
      <Sidebar activeItem="Assigned Complaints" />

      <section className="dashboard-content authority-assigned-page">
        <header className="dashboard-header">
          <div>
            <p className="page-label">AUTHORITY PORTAL</p>

            <h1>Assigned Complaints</h1>

            <p className="header-description">
              Review and manage complaints assigned to you.
            </p>
          </div>
        </header>

        <section className="assigned-summary-card">
          <div>
            <span>ASSIGNED CASES</span>
            <strong>{complaints?.length ?? 0}</strong>
          </div>

          <p>
            These complaints have been assigned to your authority account for
            review.
          </p>
        </section>

        {error && (
          <div className="authority-page-error">
            Unable to load assigned complaints.
          </div>
        )}

        {!error && (!complaints || complaints.length === 0) && (
          <section className="authority-empty-state">
            <div className="authority-empty-icon">✓</div>

            <h2>No Assigned Complaints</h2>

            <p>Complaints assigned to you will appear here.</p>
          </section>
        )}

        {!error && complaints && complaints.length > 0 && (
          <section className="assigned-complaints-list">
            {complaints.map((complaint) => (
              <article
                key={complaint.id}
                className="assigned-complaint-card"
              >
                <div className="assigned-card-top">
                  <div>
                    <p className="assigned-complaint-number">
                      {complaint.complaint_number}
                    </p>

                    <h2>{complaint.category}</h2>
                  </div>

                  <span className="assigned-status-badge">
                    {complaint.status}
                  </span>
                </div>

                <p className="assigned-description">
                  {complaint.description}
                </p>

                <div className="assigned-card-footer">
                  <div className="assigned-meta">
                    <span>
                      Priority:{" "}
                      <strong>{complaint.priority}</strong>
                    </span>

                    <span>
                      Submitted:{" "}
                      <strong>
                        {new Date(
                          complaint.created_at
                        ).toLocaleDateString("en-IN")}
                      </strong>
                    </span>
                  </div>

                  <Link
                    href={`/authority/complaints/${complaint.id}`}
                    className="assigned-view-link"
                  >
                    View Details →
                  </Link>
                </div>
              </article>
            ))}
          </section>
        )}
      </section>
    </main>
  );
}