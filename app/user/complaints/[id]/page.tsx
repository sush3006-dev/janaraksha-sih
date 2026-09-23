import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

import Sidebar from "@/components/dashboard/Sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import CitizenSatisfactionForm from "@/components/dashboard/CitizenSatisfactionForm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type ComplaintDetails = {
  id: string;
  complaint_number: string;
  category: string;
  description: string;
  detailed_description: string | null;
  incident_date: string | null;
  incident_time: string | null;
  location_address: string | null;
  city_district: string | null;
  status:
    | "SUBMITTED"
    | "ASSIGNED"
    | "IN_PROGRESS"
    | "DONE"
    | "UNDER_VERIFICATION"
    | "REOPENED"
    | "CLOSED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  resolution_summary: string | null;
  citizen_satisfaction: "SATISFIED" | "NOT_SATISFIED" | null;
  citizen_feedback: string | null;
  citizen_responded_at: string | null;
  created_at: string;
  updated_at: string;
};

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

function getStatusLabel(status: ComplaintDetails["status"]) {
  const labels: Record<ComplaintDetails["status"], string> = {
    SUBMITTED: "Submitted",
    ASSIGNED: "Assigned",
    IN_PROGRESS: "In Progress",
    DONE: "Resolved by Authority",
    UNDER_VERIFICATION: "Under Verification",
    REOPENED: "Reopened",
    CLOSED: "Closed",
  };

  return labels[status];
}

function formatDate(date: string | null) {
  if (!date) {
    return "Not provided";
  }

  return new Date(date).toLocaleString();
}

export default async function ComplaintDetailsPage({
  params,
}: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: complaint, error } = await supabase
    .from("complaints")
    .select(
      `
        id,
        complaint_number,
        category,
        description,
        detailed_description,
        incident_date,
        incident_time,
        location_address,
        city_district,
        status,
        priority,
        resolution_summary,
        citizen_satisfaction,
        citizen_feedback,
        citizen_responded_at,
        created_at,
        updated_at
      `,
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !complaint) {
    console.error("Complaint details error:", error);
    notFound();
  }

  const typedComplaint = complaint as ComplaintDetails;

  const canGiveFeedback =
    typedComplaint.status === "DONE" &&
    !typedComplaint.citizen_satisfaction;

  return (
    <main className="dashboard">
      <Sidebar activeItem="My Complaints" />

      <section className="dashboard-content">
        <DashboardHeader
          title="Complaint Details"
          description="View your complaint progress and resolution."
        />

        <div className="complaint-details-page">
          <div className="complaint-details-topbar">
            <Link
              href="/user/complaints"
              className="my-complaint-track-link"
            >
              ← Back to My Complaints
            </Link>
          </div>

          <section className="complaint-details-card">
            <div className="complaint-details-header">
              <div>
                <span className="my-complaint-number">
                  {typedComplaint.complaint_number}
                </span>

                <h1>{typedComplaint.category}</h1>
              </div>

              <span
                className={`my-complaint-status my-status-${typedComplaint.status.toLowerCase()}`}
              >
                {getStatusLabel(typedComplaint.status)}
              </span>
            </div>

            <div className="complaint-details-grid">
              <div>
                <span>Priority</span>
                <strong>{typedComplaint.priority}</strong>
              </div>

              <div>
                <span>Submitted</span>
                <strong>{formatDate(typedComplaint.created_at)}</strong>
              </div>

              <div>
                <span>Last Updated</span>
                <strong>{formatDate(typedComplaint.updated_at)}</strong>
              </div>

              <div>
                <span>Incident Date</span>
                <strong>
                  {typedComplaint.incident_date || "Not provided"}
                </strong>
              </div>

              <div>
                <span>Incident Time</span>
                <strong>
                  {typedComplaint.incident_time || "Not provided"}
                </strong>
              </div>

              <div>
                <span>Location</span>
                <strong>
                  {typedComplaint.location_address || "Not provided"}
                </strong>
              </div>
            </div>

            <div className="complaint-details-section">
              <h2>Complaint Description</h2>
              <p>{typedComplaint.description}</p>
            </div>

            {typedComplaint.detailed_description && (
              <div className="complaint-details-section">
                <h2>Detailed Description</h2>
                <p>{typedComplaint.detailed_description}</p>
              </div>
            )}

            {typedComplaint.resolution_summary && (
              <div className="complaint-resolution-section">
                <h2>Authority Resolution</h2>
                <p>{typedComplaint.resolution_summary}</p>
              </div>
            )}

            {typedComplaint.citizen_satisfaction && (
              <div className="complaint-feedback-result">
                <h2>Your Response</h2>

                <p>
                  <strong>Response: </strong>
                  {typedComplaint.citizen_satisfaction === "SATISFIED"
                    ? "Satisfied"
                    : "Not Satisfied"}
                </p>

                {typedComplaint.citizen_feedback && (
                  <p>
                    <strong>Feedback: </strong>
                    {typedComplaint.citizen_feedback}
                  </p>
                )}

                <p>
                  <strong>Submitted on: </strong>
                  {formatDate(typedComplaint.citizen_responded_at)}
                </p>
              </div>
            )}

            {canGiveFeedback && (
              <CitizenSatisfactionForm
                complaintId={typedComplaint.id}
              />
            )}

            {typedComplaint.status === "CLOSED" && (
              <div className="complaint-closed-message">
                This complaint has been verified and closed by the
                administrator.
              </div>
            )}

            {typedComplaint.status === "REOPENED" && (
              <div className="complaint-reopened-message">
                This complaint has been reopened for further action.
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}