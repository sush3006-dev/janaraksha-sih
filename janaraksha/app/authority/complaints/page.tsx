import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/dashboard/Sidebar";

export default async function AuthorityComplaintsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <p>You must be logged in.</p>;
  }

  const { data: complaints, error } = await supabase
    .from("complaints")
    .select(
      `
        id,
        complaint_number,
        category,
        description,
        status,
        priority,
        created_at
      `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Complaints fetch error:", error);

    return (
      <main className="dashboard">
        <Sidebar activeItem="Complaints" />

        <div className="dashboard-content">
          <h1>Complaints</h1>
          <p>Unable to load complaints.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="dashboard">
      <Sidebar activeItem="Complaints" />

      <div className="dashboard-content">
        <header className="dashboard-header">
          <div>
            <h1>Complaints</h1>

            <p>
              Review and manage all citizen complaints.
            </p>
          </div>
        </header>

        <section className="authority-complaints-list">
          {complaints && complaints.length > 0 ? (
            complaints.map((complaint) => (
              <Link
                key={complaint.id}
                href={`/authority/complaints/${complaint.id}`}
                className="authority-complaint-card"
              >
                <div className="authority-complaint-card-top">
                  <div>
                    <span className="authority-complaint-number">
                      {complaint.complaint_number}
                    </span>

                    <h2>{complaint.category}</h2>
                  </div>

                  <span
                    className={`authority-status-badge status-${complaint.status.toLowerCase()}`}
                  >
                    {complaint.status}
                  </span>
                </div>

                <p className="authority-complaint-description">
                  {complaint.description}
                </p>

                <div className="authority-complaint-meta">
                  <span>
                    Priority:{" "}
                    <strong>{complaint.priority}</strong>
                  </span>

                  <span>
                    Submitted:{" "}
                    <strong>
                      {new Date(
                        complaint.created_at
                      ).toLocaleDateString()}
                    </strong>
                  </span>

                  <span className="authority-view-link">
                    View Details →
                  </span>
                </div>
              </Link>
            ))
          ) : (
            <div className="authority-empty-state">
              <h2>No complaints yet</h2>

              <p>
                Submitted citizen complaints will
                appear here.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}