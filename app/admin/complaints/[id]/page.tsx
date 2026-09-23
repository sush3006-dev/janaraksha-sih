import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import Sidebar from "@/components/dashboard/Sidebar";
import AssignComplaintButton from "@/components/dashboard/AssignComplaintButton";
import AdminComplaintActionButton from "@/components/dashboard/AdminComplaintActionButton";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

type ComplaintStatus =
  | "SUBMITTED"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "DONE"
  | "UNDER_VERIFICATION"
  | "REOPENED"
  | "CLOSED";

type Complaint = {
  id: string;
  complaint_number: string;
  user_id: string;

  category: string;
  description: string;

  incident_date: string | null;
  incident_time: string | null;
  time_not_known: boolean;

  incident_methods: string | null;
  detailed_description: string | null;
  frequency: string | null;
  immediate_danger: boolean;

  location_address: string | null;
  city_district: string | null;

  status: ComplaintStatus;
  assigned_authority_id: string | null;
  priority: string;

  created_at: string;

  resolution_summary: string | null;
  closed_at: string | null;

  // Citizen response
  citizen_satisfaction: "SATISFIED" | "NOT_SATISFIED" | null;

  citizen_feedback: string | null;

  citizen_responded_at: string | null;

  // Admin verification
  verified_by: string | null;
  verified_at: string | null;
};

type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  account_status: string | null;
  role?: string;
};

type ComplaintPerson = {
  id: string;
  full_name: string | null;
  involved_type: string | null;
  alias: string | null;
  contact: string | null;
  relationship: string | null;
};

type ComplaintEvidence = {
  id: string;
  file_name: string;
  file_type: string | null;
  evidence_type: string | null;
  uploaded_at: string;
};

function formatDate(date: string | null) {
  if (!date) {
    return "Not provided";
  }

  return new Date(date).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatDateOnly(date: string | null) {
  if (!date) {
    return "Not provided";
  }

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function getStatusLabel(status: ComplaintStatus) {
  const labels: Record<ComplaintStatus, string> = {
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

export default async function AdminComplaintDetailsPage({ params }: PageProps) {
  const { id } = await params;

  const supabase = await createClient();

  // =========================================================
  // AUTHENTICATION
  // =========================================================

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // =========================================================
  // ADMIN CHECK
  // =========================================================

  const { data: adminProfile, error: adminProfileError } = await supabase
    .from("profiles")
    .select("id, full_name, role")
    .eq("id", user.id)
    .single();

  if (adminProfileError || !adminProfile) {
    redirect("/auth/login");
  }

  if (adminProfile.role !== "SUPER_ADMIN") {
    if (adminProfile.role === "USER") {
      redirect("/user");
    }

    if (adminProfile.role === "AUTHORITY") {
      redirect("/authority");
    }

    redirect("/auth/login");
  }

  // =========================================================
  // GET COMPLAINT
  // =========================================================

  const { data: complaintData, error: complaintError } = await supabase
    .from("complaints")
    .select("*")
    .eq("id", id)
    .single();

  if (complaintError || !complaintData) {
    console.error("Admin complaint error:", complaintError);
    notFound();
  }

  const complaint = complaintData as Complaint;

  // =========================================================
  // GET CITIZEN
  // =========================================================

  const { data: citizenData } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone, account_status")
    .eq("id", complaint.user_id)
    .maybeSingle();

  const citizen = citizenData as Profile | null;

  // =========================================================
  // GET ASSIGNED AUTHORITY
  // =========================================================

  let assignedAuthority: Profile | null = null;

  if (complaint.assigned_authority_id) {
    const { data: authorityData } = await supabase
      .from("profiles")
      .select("id, full_name, email, phone, account_status, role")
      .eq("id", complaint.assigned_authority_id)
      .eq("role", "AUTHORITY")
      .maybeSingle();

    assignedAuthority = authorityData as Profile | null;
  }

  // =========================================================
  // GET INVOLVED PEOPLE
  // =========================================================

  const { data: peopleData } = await supabase
    .from("complaint_people")
    .select("*")
    .eq("complaint_id", id)
    .order("created_at", {
      ascending: true,
    });

  const people = (peopleData ?? []) as ComplaintPerson[];

  // =========================================================
  // GET EVIDENCE
  // =========================================================

  const { data: evidenceData } = await supabase
    .from("complaint_evidence")
    .select("*")
    .eq("complaint_id", id)
    .order("uploaded_at", {
      ascending: true,
    });

  const evidence = (evidenceData ?? []) as ComplaintEvidence[];

  // =========================================================
  // WORKFLOW STATE
  // =========================================================

  const hasAuthorityResolution = Boolean(complaint.resolution_summary?.trim());

  const hasCitizenResponse =
    complaint.citizen_satisfaction === "SATISFIED" ||
    complaint.citizen_satisfaction === "NOT_SATISFIED";

  const hasCitizenFeedback = Boolean(complaint.citizen_feedback?.trim());

  const isWaitingForCitizen =
    complaint.status === "DONE" && !hasCitizenResponse;

  const isReadyForVerification =
    hasCitizenResponse &&
    complaint.status !== "CLOSED" &&
    complaint.status !== "REOPENED";

  const isFinalized =
    complaint.status === "CLOSED" || complaint.status === "REOPENED";

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <main className="dashboard">
      <Sidebar activeItem="Complaints" />

      <section className="dashboard-content">
        {/* ==================================================
            HEADER
        ================================================== */}

        <header className="authority-dashboard-header">
          <div className="authority-welcome">
            <p className="authority-eyebrow">JanaRaksha Admin Portal</p>

            <h1>Complaint Details</h1>

            <p className="authority-description">
              View complaint information, authority resolution, citizen
              response, feedback and final verification.
            </p>
          </div>

          <div className="authority-header-actions">
            <Link href="/admin/complaints" className="admin-view-button">
              ← Back to Complaints
            </Link>

            <Link href="/admin/profile" className="profile-button">
              <span className="profile-icon">●</span>
              <span>Profile</span>
            </Link>
          </div>
        </header>

        {/* ==================================================
            COMPLAINT SUMMARY
        ================================================== */}

        <section className="profile-section-card">
          <div className="profile-section-header">
            <div>
              <p className="case-section-label">COMPLAINT SUMMARY</p>

              <h2>{complaint.complaint_number}</h2>

              <p>Submitted on {formatDate(complaint.created_at)}</p>
            </div>
          </div>

          <div className="profile-info-list">
            <div className="profile-info-row">
              <span>Category</span>
              <strong>{complaint.category}</strong>
            </div>

            <div className="profile-info-row">
              <span>Status</span>
              <strong>{getStatusLabel(complaint.status)}</strong>
            </div>

            <div className="profile-info-row">
              <span>Priority</span>
              <strong>{complaint.priority}</strong>
            </div>

            <div className="profile-info-row">
              <span>Incident Date</span>
              <strong>{formatDateOnly(complaint.incident_date)}</strong>
            </div>

            <div className="profile-info-row">
              <span>Incident Time</span>
              <strong>
                {complaint.time_not_known
                  ? "Time not known"
                  : complaint.incident_time || "Not provided"}
              </strong>
            </div>

            <div className="profile-info-row">
              <span>Incident Location</span>
              <strong>{complaint.location_address || "Not provided"}</strong>
            </div>

            <div className="profile-info-row">
              <span>City / District</span>
              <strong>{complaint.city_district || "Not provided"}</strong>
            </div>

            <div className="profile-info-row">
              <span>Immediate Danger</span>
              <strong>{complaint.immediate_danger ? "Yes" : "No"}</strong>
            </div>
          </div>
        </section>

        {/* ==================================================
            INCIDENT INFORMATION
        ================================================== */}

        <section className="profile-section-card">
          <div className="profile-section-header">
            <div>
              <p className="case-section-label">INCIDENT INFORMATION</p>

              <h2>Incident Details</h2>
            </div>
          </div>

          <div className="profile-info-list">
            <div className="profile-info-row">
              <span>Methods Involved</span>

              <strong>{complaint.incident_methods || "Not provided"}</strong>
            </div>

            <div className="profile-info-row">
              <span>Frequency</span>

              <strong>{complaint.frequency || "Not provided"}</strong>
            </div>
          </div>

          <div className="case-description-block">
            <h3>Description</h3>

            <p>{complaint.description || "No description provided."}</p>
          </div>

          {complaint.detailed_description && (
            <div className="case-description-block">
              <h3>Detailed Description</h3>

              <p>{complaint.detailed_description}</p>
            </div>
          )}
        </section>

        {/* ==================================================
            CITIZEN INFORMATION
        ================================================== */}

        <section className="profile-section-card">
          <div className="profile-section-header">
            <div>
              <p className="case-section-label">CITIZEN INFORMATION</p>

              <h2>Submitted By</h2>
            </div>
          </div>

          <div className="profile-info-list">
            <div className="profile-info-row">
              <span>Full Name</span>

              <strong>{citizen?.full_name || "Not available"}</strong>
            </div>

            <div className="profile-info-row">
              <span>Email Address</span>

              <strong>{citizen?.email || "Not available"}</strong>
            </div>

            <div className="profile-info-row">
              <span>Phone Number</span>

              <strong>{citizen?.phone || "Not provided"}</strong>
            </div>

            <div className="profile-info-row">
              <span>Account Status</span>

              <strong>{citizen?.account_status || "Not available"}</strong>
            </div>
          </div>
        </section>

        {/* ==================================================
            ASSIGNMENT INFORMATION
        ================================================== */}

        <section className="profile-section-card">
          <div className="profile-section-header">
            <div>
              <p className="case-section-label">ASSIGNMENT INFORMATION</p>

              <h2>Assigned Authority</h2>
            </div>
          </div>

          <div className="profile-info-list">
            <div className="profile-info-row">
              <span>Authority Name</span>

              <strong>{assignedAuthority?.full_name || "Not assigned"}</strong>
            </div>

            <div className="profile-info-row">
              <span>Authority Email</span>

              <strong>{assignedAuthority?.email || "Not available"}</strong>
            </div>

            <div className="profile-info-row">
              <span>Authority Status</span>

              <strong>
                {assignedAuthority?.account_status || "Not available"}
              </strong>
            </div>
          </div>

          {complaint.status === "SUBMITTED" && (
            <div className="assignment-action-wrapper">
              <h3>Assign Authority</h3>

              <AssignComplaintButton complaintId={complaint.id} />
            </div>
          )}

          {complaint.status === "REOPENED" && (
            <div className="assignment-action-wrapper">
              <h3>Assign Authority Again</h3>

              <p>
                The citizen was not satisfied with the previous resolution.
                Assign the complaint to an authority for further action.
              </p>

              <AssignComplaintButton complaintId={complaint.id} />
            </div>
          )}
        </section>

        {/* ==================================================
            COMPLETE RESOLUTION WORKFLOW
        ================================================== */}

        <section className="profile-section-card">
          <div className="profile-section-header">
            <div>
              <p className="case-section-label">
                COMPLAINT RESOLUTION WORKFLOW
              </p>

              <h2>Resolution & Verification</h2>

              <p>
                Follow the complaint from authority resolution to final
                administrative verification.
              </p>
            </div>
          </div>

          {/* ==================================================
              STEP 1 — AUTHORITY RESOLUTION
          ================================================== */}

          <div className="workflow-step">
            <div className="workflow-step-header">
              <div>
                <p className="case-section-label">STEP 1</p>

                <h3>Authority Resolution</h3>
              </div>

              <span
                className={
                  hasAuthorityResolution
                    ? "workflow-status workflow-complete"
                    : "workflow-status workflow-pending"
                }
              >
                {hasAuthorityResolution ? "Completed" : "Pending"}
              </span>
            </div>

            <div className="case-description-block">
              {hasAuthorityResolution ? (
                <p>{complaint.resolution_summary}</p>
              ) : (
                <p>The authority has not submitted a resolution yet.</p>
              )}
            </div>
          </div>

          {/* ==================================================
              STEP 2 — CITIZEN RESPONSE
          ================================================== */}

          <div className="workflow-step">
            <div className="workflow-step-header">
              <div>
                <p className="case-section-label">STEP 2</p>

                <h3>Citizen Response</h3>
              </div>

              <span
                className={
                  hasCitizenResponse
                    ? "workflow-status workflow-complete"
                    : "workflow-status workflow-pending"
                }
              >
                {hasCitizenResponse ? "Received" : "Waiting"}
              </span>
            </div>

            <div className="profile-info-list">
              <div className="profile-info-row">
                <span>Citizen Response</span>

                <strong>
                  {complaint.citizen_satisfaction === "SATISFIED"
                    ? "Satisfied"
                    : complaint.citizen_satisfaction === "NOT_SATISFIED"
                      ? "Not Satisfied"
                      : "Response not submitted"}
                </strong>
              </div>

              <div className="profile-info-row">
                <span>Response Submitted At</span>

                <strong>{formatDate(complaint.citizen_responded_at)}</strong>
              </div>
            </div>

            {!hasCitizenResponse && (
              <div className="workflow-pending-message">
                The authority has completed the complaint. Waiting for the
                citizen to review the resolution.
              </div>
            )}
          </div>

          {/* ==================================================
              STEP 3 — CITIZEN FEEDBACK
          ================================================== */}

          <div className="workflow-step">
            <div className="workflow-step-header">
              <div>
                <p className="case-section-label">STEP 3</p>

                <h3>Citizen Feedback</h3>
              </div>

              <span
                className={
                  hasCitizenFeedback
                    ? "workflow-status workflow-complete"
                    : hasCitizenResponse
                      ? "workflow-status workflow-complete"
                      : "workflow-status workflow-pending"
                }
              >
                {hasCitizenFeedback
                  ? "Received"
                  : hasCitizenResponse
                    ? "No Additional Feedback"
                    : "Waiting"}
              </span>
            </div>

            <div className="case-description-block">
              {hasCitizenFeedback ? (
                <p>{complaint.citizen_feedback}</p>
              ) : hasCitizenResponse ? (
                <p>Citizen did not provide additional feedback.</p>
              ) : (
                <p>
                  Citizen feedback will appear here after the citizen submits a
                  response.
                </p>
              )}
            </div>
          </div>

          {/* ==================================================
              STEP 4 — ADMIN VERIFICATION
          ================================================== */}

          <div className="workflow-step">
            <div className="workflow-step-header">
              <div>
                <p className="case-section-label">STEP 4</p>

                <h3>Admin Verification</h3>
              </div>

              <span
                className={
                  isFinalized
                    ? "workflow-status workflow-complete"
                    : isReadyForVerification
                      ? "workflow-status workflow-ready"
                      : "workflow-status workflow-pending"
                }
              >
                {isFinalized
                  ? complaint.status === "CLOSED"
                    ? "Closed"
                    : "Reopened"
                  : isReadyForVerification
                    ? "Ready for Verification"
                    : isWaitingForCitizen
                      ? "Waiting for Citizen"
                      : "Waiting"}
              </span>
            </div>

            {/* ==================================================
                VERIFICATION SUMMARY
            ================================================== */}

            <div className="verification-summary">
              <div className="verification-summary-item">
                <span>Authority Resolution</span>

                <strong>
                  {complaint.resolution_summary || "Not provided"}
                </strong>
              </div>

              <div className="verification-summary-item">
                <span>Citizen Response</span>

                <strong>
                  {complaint.citizen_satisfaction === "SATISFIED"
                    ? "Satisfied"
                    : complaint.citizen_satisfaction === "NOT_SATISFIED"
                      ? "Not Satisfied"
                      : "Not submitted"}
                </strong>
              </div>

              <div className="verification-summary-item">
                <span>Citizen Feedback</span>

                <strong>
                  {complaint.citizen_feedback?.trim()
                    ? complaint.citizen_feedback
                    : "No additional feedback provided."}
                </strong>
              </div>

              <div className="verification-summary-item">
                <span>Citizen Responded At</span>

                <strong>{formatDate(complaint.citizen_responded_at)}</strong>
              </div>
            </div>

            {/* ==================================================
                VERIFICATION OPTIONS
            ================================================== */}

            {isReadyForVerification && (
              <div className="verification-action-wrapper">
                <p className="case-section-label">VERIFICATION OPTIONS</p>

                <h3>Final Administrative Action</h3>

                <p>
                  Review the authority resolution, citizen response and citizen
                  feedback before confirming the final status.
                </p>

                <AdminComplaintActionButton
                  complaintId={complaint.id}
                  currentStatus={complaint.status}
                  citizenSatisfaction={complaint.citizen_satisfaction}
                  citizenFeedback={complaint.citizen_feedback}
                  citizenRespondedAt={complaint.citizen_responded_at}
                  resolutionSummary={complaint.resolution_summary}
                />
              </div>
            )}

            {/* ==================================================
                WAITING FOR CITIZEN
            ================================================== */}

            {isWaitingForCitizen && (
              <div className="workflow-pending-message">
                <strong>Waiting for Citizen Response</strong>

                <p>
                  The authority has completed the complaint. Admin verification
                  will become available after the citizen reviews the resolution
                  and submits their response.
                </p>
              </div>
            )}

            {/* ==================================================
                CLOSED
            ================================================== */}

            {complaint.status === "CLOSED" && (
              <div className="workflow-final-message workflow-closed">
                <strong>Complaint Closed</strong>

                <p>
                  The administrator verified the citizen response and closed
                  this complaint.
                </p>
              </div>
            )}

            {/* ==================================================
                REOPENED
            ================================================== */}

            {complaint.status === "REOPENED" && (
              <div className="workflow-final-message workflow-reopened">
                <strong>Complaint Reopened</strong>

                <p>
                  The citizen was not satisfied with the resolution. The
                  complaint has been reopened for further action.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ==================================================
            INVOLVED PEOPLE
        ================================================== */}

        <section className="profile-section-card">
          <div className="profile-section-header">
            <div>
              <p className="case-section-label">PEOPLE AND INFORMATION</p>

              <h2>Involved People</h2>
            </div>
          </div>

          {people.length > 0 ? (
            <div className="admin-users-table-wrapper">
              <table className="admin-users-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Alias</th>
                    <th>Contact</th>
                    <th>Relationship</th>
                  </tr>
                </thead>

                <tbody>
                  {people.map((person) => (
                    <tr key={person.id}>
                      <td>{person.full_name || "Not provided"}</td>

                      <td>{person.involved_type || "Not provided"}</td>

                      <td>{person.alias || "Not provided"}</td>

                      <td>{person.contact || "Not provided"}</td>

                      <td>{person.relationship || "Not provided"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="admin-empty-state">
              <h3>No involved people added</h3>

              <p>No additional people were recorded for this complaint.</p>
            </div>
          )}
        </section>

        {/* ==================================================
            EVIDENCE
        ================================================== */}

        <section className="profile-section-card">
          <div className="profile-section-header">
            <div>
              <p className="case-section-label">EVIDENCE AND DOCUMENTS</p>

              <h2>Evidence</h2>
            </div>
          </div>

          {evidence.length > 0 ? (
            <div className="admin-users-table-wrapper">
              <table className="admin-users-table">
                <thead>
                  <tr>
                    <th>File Name</th>
                    <th>Type</th>
                    <th>Evidence Type</th>
                    <th>Uploaded</th>
                  </tr>
                </thead>

                <tbody>
                  {evidence.map((file) => (
                    <tr key={file.id}>
                      <td>
                        <strong>{file.file_name}</strong>
                      </td>

                      <td>{file.file_type || "Not provided"}</td>

                      <td>{file.evidence_type || "Not provided"}</td>

                      <td>{formatDate(file.uploaded_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="admin-empty-state">
              <h3>No evidence uploaded</h3>

              <p>No evidence files were attached to this complaint.</p>
            </div>
          )}
        </section>

        {/* ==================================================
            FINAL VERIFICATION STATUS
        ================================================== */}

        {isFinalized && (
          <section className="profile-section-card">
            <div className="profile-section-header">
              <div>
                <p className="case-section-label">FINAL VERIFICATION STATUS</p>

                <h2>
                  {complaint.status === "CLOSED"
                    ? "Complaint Closed"
                    : "Complaint Reopened"}
                </h2>
              </div>
            </div>

            <div className="profile-info-list">
              <div className="profile-info-row">
                <span>Final Status</span>

                <strong>{getStatusLabel(complaint.status)}</strong>
              </div>

              <div className="profile-info-row">
                <span>Verified At</span>

                <strong>{formatDate(complaint.verified_at)}</strong>
              </div>

              <div className="profile-info-row">
                <span>Closed At</span>

                <strong>{formatDate(complaint.closed_at)}</strong>
              </div>
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
