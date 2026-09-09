import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/dashboard/Sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

type Complaint = {
  id: string;
  complaint_number: string;
  category: string;
  description: string;
  status: "SUBMITTED" | "ASSIGNED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  assigned_authority_id: string | null;
  created_at: string;
  updated_at: string;
};

function getStatusLabel(status: Complaint["status"]) {
  if (status === "SUBMITTED") {
    return "Submitted";
  }

  if (status === "ASSIGNED") {
    return "Assigned";
  }

  return status;
}

function formatDate(date: string) {
  return new Date(date).toLocaleString();
}

export default async function MyComplaintsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="dashboard">
        <Sidebar activeItem="My Complaints" />

        <section className="dashboard-content">
          <DashboardHeader
            title="My Complaints"
            description="View and manage your submitted complaints."
          />

          <section className="track-error-card">
            <h2>Authentication Required</h2>

            <p>
              Please sign in to view your complaints.
            </p>

            <Link
              href="/auth/login"
              className="primary-button"
            >
              Sign In
            </Link>
          </section>
        </section>
      </main>
    );
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
        assigned_authority_id,
        created_at,
        updated_at
      `
    )
    .eq("user_id", user.id)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "My complaints error:",
      error
    );

    return (
      <main className="dashboard">
        <Sidebar activeItem="My Complaints" />

        <section className="dashboard-content">
          <DashboardHeader
            title="My Complaints"
            description="View and manage your submitted complaints."
          />

          <section className="track-error-card">
            <h2>Unable to Load Complaints</h2>

            <p>
              We could not load your complaints right now.
              Please try again.
            </p>
          </section>
        </section>
      </main>
    );
  }

  return (
    <main className="dashboard">
      <Sidebar activeItem="My Complaints" />

      <section className="dashboard-content">

        <DashboardHeader
          title="My Complaints"
          description="View and manage your submitted complaints."
        />

        {complaints && complaints.length > 0 ? (
          <section className="my-complaints-list">

            {complaints.map((complaint) => (
              <article
                key={complaint.id}
                className="my-complaint-card"
              >

                <div className="my-complaint-header">

                  <div>
                    <span className="my-complaint-number">
                      {complaint.complaint_number}
                    </span>

                    <h2>
                      {complaint.category}
                    </h2>
                  </div>

                  <span
                    className={`my-complaint-status my-status-${complaint.status.toLowerCase()}`}
                  >
                    {getStatusLabel(
                      complaint.status
                    )}
                  </span>

                </div>

                <p className="my-complaint-description">
                  {complaint.description}
                </p>

                <div className="my-complaint-details">

                  <div>
                    <span>Priority</span>

                    <strong>
                      {complaint.priority}
                    </strong>
                  </div>

                  <div>
                    <span>Submitted</span>

                    <strong>
                      {formatDate(
                        complaint.created_at
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Last Updated</span>

                    <strong>
                      {formatDate(
                        complaint.updated_at
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Authority</span>

                    <strong>
                      {complaint.assigned_authority_id
                        ? "Assigned"
                        : "Not assigned"}
                    </strong>
                  </div>

                </div>

                <div className="my-complaint-footer">

                  <span>
                    Complaint ID:{" "}
                    <strong>
                      {complaint.complaint_number}
                    </strong>
                  </span>

                  <Link
                    href="/user/track"
                    className="my-complaint-track-link"
                  >
                    Track Complaint →
                  </Link>

                </div>

              </article>
            ))}

          </section>
        ) : (
          <section className="my-complaints-empty">

            <div className="track-empty-icon">
              —
            </div>

            <h2>No complaints yet</h2>

            <p>
              You have not submitted any complaints.
              Your registered complaints will appear here.
            </p>

            <Link
              href="/user/register-complaint"
              className="primary-button"
            >
              Register Your First Complaint
            </Link>

          </section>
        )}

      </section>
    </main>
  );
}