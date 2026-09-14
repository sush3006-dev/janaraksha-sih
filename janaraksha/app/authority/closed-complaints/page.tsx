import Link from "next/link";
import Sidebar from "@/components/dashboard/Sidebar";
import { createClient } from "@/lib/supabase/server";

export default async function ClosedComplaintsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "AUTHORITY") {
    return null;
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
        closed_at,
        resolution_summary,
        assigned_authority_id
      `
    )
    .eq("assigned_authority_id", user.id)
    .eq("status", "CLOSED")
    .order("closed_at", { ascending: false });

  return (
    <main className="dashboard">
      <Sidebar activeItem="Closed Complaints" />

      <section className="dashboard-content authority-closed-page">
        <header className="dashboard-header">
          <div>
            <p className="page-label">AUTHORITY PORTAL</p>

            <h1>Closed Complaints</h1>

            <p className="header-description">
              View complaints that have been reviewed and
              marked as resolved.
            </p>
          </div>
        </header>

        <section className="closed-summary-card">
          <div>
            <span>RESOLVED CASES</span>
            <strong>{complaints?.length || 0}</strong>
          </div>

          <p>
            These complaints have been resolved under your
            authority account.
          </p>
        </section>

        {error && (
          <div className="authority-page-error">
            Unable to load closed complaints.
          </div>
        )}

        {!error &&
          (!complaints || complaints.length === 0) && (
            <section className="authority-empty-state">
              <div className="authority-empty-icon">✓</div>

              <h2>No Closed Complaints</h2>

              <p>
                Complaints marked as resolved will appear here.
              </p>
            </section>
          )}

        {!error &&
          complaints &&
          complaints.length > 0 && (
            <section className="closed-complaints-list">
              {complaints.map((complaint) => (
                <article
                  key={complaint.id}
                  className="closed-complaint-card"
                >
                  <div className="closed-card-top">
                    <div>
                      <p className="closed-complaint-number">
                        {complaint.complaint_number}
                      </p>

                      <h2>{complaint.category}</h2>
                    </div>

                    <span className="closed-status-badge">
                      CLOSED
                    </span>
                  </div>

                  <p className="closed-description">
                    {complaint.description}
                  </p>

                  {complaint.resolution_summary && (
                    <div className="closed-resolution-box">
                      <span>RESOLUTION</span>

                      <p>
                        {complaint.resolution_summary}
                      </p>
                    </div>
                  )}

                  <div className="closed-card-footer">
                    <div className="closed-meta">
                      <span>
                        Priority:{" "}
                        <strong>
                          {complaint.priority}
                        </strong>
                      </span>

                      <span>
                        Closed:{" "}
                        <strong>
                          {complaint.closed_at
                            ? new Date(
                                complaint.closed_at
                              ).toLocaleDateString(
                                "en-IN"
                              )
                            : "Not available"}
                        </strong>
                      </span>
                    </div>

                    <Link
                      href={`/authority/complaints/${complaint.id}`}
                      className="closed-view-link"
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