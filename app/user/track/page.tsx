
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/dashboard/Sidebar";

type Complaint = {
  id: string;
  complaint_number: string;
  category: string;
  status: "SUBMITTED" | "ASSIGNED";
  created_at: string;
  updated_at: string;
};

function getStatusLabel(status: Complaint["status"]) {
  switch (status) {
    case "SUBMITTED":
      return "Submitted";

    case "ASSIGNED":
      return "Assigned";

    default:
      return status;
  }
}

function getStatusDescription(status: Complaint["status"]) {
  switch (status) {
    case "SUBMITTED":
      return "Your complaint has been successfully submitted and is waiting for authority assignment.";

    case "ASSIGNED":
      return "Your complaint has been assigned to an authority and is now under review.";

    default:
      return "Your complaint status has been updated.";
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleString();
}

export default async function ComplaintTrackPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="dashboard">
        <Sidebar activeItem="Complaint Track" />

        <div className="dashboard-content">
          <section className="track-error-card">
            <h1>Authentication Required</h1>

            <p>Please sign in to view your complaint status.</p>

            <Link href="/auth/login" className="primary-button">
              Sign In
            </Link>
          </section>
        </div>
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
        status,
        created_at,
        updated_at
      `
    )
    .eq("user_id", user.id)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error("Complaint track error:", error);

    return (
      <main className="dashboard">
        <Sidebar activeItem="Complaint Track" />

        <div className="dashboard-content">
          <section className="track-error-card">
            <h1>Unable to Load Complaints</h1>

            <p>
              We could not load your complaints right now. Please try again.
            </p>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="dashboard">
      <Sidebar activeItem="Complaint Track" />

      <div className="dashboard-content">
        {/* Page Header */}
        <header className="dashboard-header">
          <div>
            <p className="authority-section-eyebrow">JANARAKSHA</p>

            <h1>Complaint Track</h1>

            <p>Check the latest status and updates on your complaints.</p>
          </div>
        </header>

        {/* Empty State */}
        {!complaints || complaints.length === 0 ? (
          <section className="track-empty-state">
            <div className="track-empty-icon">—</div>

            <h2>No complaints yet</h2>

            <p>
              You have not submitted any complaints. Once you register a
              complaint, its progress will appear here.
            </p>

            <Link
              href="/user/register-complaint"
              className="primary-button"
            >
              Register Your First Complaint
            </Link>
          </section>
        ) : (
          <section className="track-complaints-list">
            {complaints.map((complaint) => {
              const isAssigned = complaint.status === "ASSIGNED";

              return (
                <article
                  key={complaint.id}
                  className="track-complaint-card"
                >
                  {/* Complaint ID and Type */}
                  <div className="track-card-header">
                    <div>
                      <span className="track-complaint-number">
                        {complaint.complaint_number}
                      </span>

                      <h2>{complaint.category}</h2>
                    </div>
                  </div>

                  {/* Complaint Journey */}
                  <div className="track-journey">
                    <div className="track-journey-heading">
                      Complaint Journey
                    </div>

                    <div className="track-timeline">
                      {/* Complaint Submitted */}
                      <div className="track-timeline-item completed">
                        <div className="track-timeline-marker">✓</div>

                        <div className="track-timeline-content">
                          <strong>Complaint Submitted</strong>

                          <p>
                            Your complaint was successfully registered.
                          </p>

                          <span>
                            {formatDate(complaint.created_at)}
                          </span>
                        </div>
                      </div>

                      {/* Timeline Connector */}
                      <div
                        className={`track-timeline-line ${
                          isAssigned ? "completed" : ""
                        }`}
                      />

                      {/* Authority Assigned */}
                      <div
                        className={`track-timeline-item ${
                          isAssigned ? "completed" : "pending"
                        }`}
                      >
                        <div className="track-timeline-marker">
                          {isAssigned ? "✓" : "2"}
                        </div>

                        <div className="track-timeline-content">
                          <strong>Authority Assigned</strong>

                          <p>
                            {isAssigned
                              ? "Your complaint has been assigned and is now under review."
                              : "Your complaint is waiting to be assigned to an authority."}
                          </p>

                          {isAssigned && (
                            <span>
                              Last updated{" "}
                              {formatDate(complaint.updated_at)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Current Status */}
                  <div className="track-current-status">
                    <span>CURRENT STATUS</span>

                    <h3>{getStatusLabel(complaint.status)}</h3>

                    <p>{getStatusDescription(complaint.status)}</p>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}