import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/dashboard/Sidebar";
import EvidenceViewer from "@/components/dashboard/EvidenceViewer";
import AssignComplaintButton from "@/components/dashboard/AssignComplaintButton";

type ComplaintDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ComplaintDetailsPage({
  params,
}: ComplaintDetailsPageProps) {
  const { id } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <p>You must be logged in.</p>;
  }

  const { data: complaint, error: complaintError } =
    await supabase
      .from("complaints")
      .select("*")
      .eq("id", id)
      .single();

  if (complaintError || !complaint) {
    console.error(
      "Complaint details error:",
      complaintError
    );

    notFound();
  }

  const { data: people, error: peopleError } =
    await supabase
      .from("complaint_people")
      .select("*")
      .eq("complaint_id", id)
      .order("created_at", { ascending: true });

  if (peopleError) {
    console.error(
      "Complaint people error:",
      peopleError
    );
  }

  const { data: evidence, error: evidenceError } =
    await supabase
      .from("complaint_evidence")
      .select(`
        id,
        complaint_id,
        file_name,
        file_size,
        file_type,
        evidence_type,
        storage_path,
        uploaded_at
      `)
      .eq("complaint_id", id)
      .order("uploaded_at", { ascending: true });

  if (evidenceError) {
    console.error(
      "Complaint evidence error:",
      evidenceError
    );
  }

  const submittedDate = new Date(
    complaint.created_at
  ).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <main className="dashboard">
      <Sidebar activeItem="Complaints" />

      <div className="dashboard-content authority-case-page">

        {/* ───────────── TOP HEADER ───────────── */}
        <header className="case-page-header">
          <div>
            <Link
              href="/authority/complaints"
              className="case-back-link"
            >
              ← Back to Complaints
            </Link>

            <div className="case-heading-row">
              <div>
                <p className="case-eyebrow">
                  Complaint Case
                </p>

                <h1>Complaint Details</h1>

                <p className="case-number">
                  {complaint.complaint_number}
                </p>
              </div>

              <div className="case-status-group">
                <span
                  className={`case-status-badge status-${complaint.status.toLowerCase()}`}
                >
                  <span className="case-status-dot" />
                  {complaint.status}
                </span>

                <span
                  className={`case-priority-badge priority-${complaint.priority.toLowerCase()}`}
                >
                  {complaint.priority} Priority
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* ───────────── CASE SUMMARY ───────────── */}
        <section className="case-summary-card">

          <div className="case-summary-top">
            <div>
              <p className="case-section-label">
                CASE SUMMARY
              </p>

              <h2>
                {complaint.category}
              </h2>
            </div>

            <div className="case-submitted">
              <span>Submitted</span>
              <strong>{submittedDate}</strong>
            </div>
          </div>

          <div className="case-summary-grid">

            <div className="case-summary-item">
              <span>Complaint Number</span>
              <strong>{complaint.complaint_number}</strong>
            </div>

            <div className="case-summary-item">
              <span>Category</span>
              <strong>{complaint.category}</strong>
            </div>

            <div className="case-summary-item">
              <span>Status</span>
              <strong>{complaint.status}</strong>
            </div>

            <div className="case-summary-item">
              <span>Priority</span>
              <strong>{complaint.priority}</strong>
            </div>

          </div>

          <div className="case-description-box">
            <span>Complaint Description</span>
            <p>{complaint.description}</p>
          </div>

          {/* Assignment */}
          {complaint.status === "SUBMITTED" && (
            <div className="case-action-panel">
              <div>
                <p className="case-action-title">
                  Ready for Assignment
                </p>

                <p className="case-action-text">
                  Assign this complaint to yourself to
                  begin reviewing the case.
                </p>
              </div>

              <AssignComplaintButton
                complaintId={complaint.id}
              />
            </div>
          )}

          {complaint.status === "ASSIGNED" && (
            <div className="case-assigned-panel">
              <span className="case-assigned-icon">
                ✓
              </span>

              <div>
                <strong>
                  Complaint Assigned
                </strong>

                <p>
                  This complaint is currently under
                  authority review.
                </p>
              </div>
            </div>
          )}

        </section>

        {/* ───────────── INCIDENT ───────────── */}
        <section className="case-card">

          <div className="case-card-header">
            <div className="case-card-icon">
              ⚠
            </div>

            <div>
              <p className="case-section-label">
                INCIDENT
              </p>

              <h2>Incident Details</h2>

              <p>
                Information provided by the citizen
                about the incident.
              </p>
            </div>
          </div>

          <div className="case-info-grid">

            <div className="case-info-item">
              <span>Incident Date</span>
              <strong>
                {complaint.incident_date ||
                  "Not provided"}
              </strong>
            </div>

            <div className="case-info-item">
              <span>Incident Time</span>
              <strong>
                {complaint.time_not_known
                  ? "Time not known"
                  : complaint.incident_time ||
                    "Not provided"}
              </strong>
            </div>

            <div className="case-info-item">
              <span>Frequency</span>
              <strong>
                {complaint.frequency ||
                  "Not provided"}
              </strong>
            </div>

            <div className="case-info-item">
              <span>Immediate Danger</span>

              <strong
                className={
                  complaint.immediate_danger
                    ? "danger-yes"
                    : "danger-no"
                }
              >
                {complaint.immediate_danger
                  ? "Yes"
                  : "No"}
              </strong>
            </div>

          </div>

          <div className="case-text-block">
            <span>Incident Methods</span>

            <p>
              {complaint.incident_methods ||
                "Not provided"}
            </p>
          </div>

          {complaint.detailed_description && (
            <div className="case-text-block">
              <span>Detailed Description</span>

              <p>
                {complaint.detailed_description}
              </p>
            </div>
          )}

        </section>

        {/* ───────────── LOCATION ───────────── */}
        <section className="case-card">

          <div className="case-card-header">
            <div className="case-card-icon">
              ⌖
            </div>

            <div>
              <p className="case-section-label">
                LOCATION
              </p>

              <h2>Incident Location</h2>

              <p>
                Location information associated with
                the reported incident.
              </p>
            </div>
          </div>

          <div className="case-location-highlight">
            <span>Address</span>

            <strong>
              {complaint.location_address ||
                "Not provided"}
            </strong>
          </div>

          <div className="case-info-grid">

            <div className="case-info-item">
              <span>City / District</span>

              <strong>
                {complaint.city_district ||
                  "Not provided"}
              </strong>
            </div>

            <div className="case-info-item">
              <span>Latitude</span>

              <strong>
                {complaint.latitude ??
                  "Not available"}
              </strong>
            </div>

            <div className="case-info-item">
              <span>Longitude</span>

              <strong>
                {complaint.longitude ??
                  "Not available"}
              </strong>
            </div>

            <div className="case-info-item">
              <span>Location Accuracy</span>

              <strong>
                {complaint.location_accuracy
                  ? `${complaint.location_accuracy} m`
                  : "Not available"}
              </strong>
            </div>

          </div>

        </section>

        {/* ───────────── PEOPLE ───────────── */}
        <section className="case-card">

          <div className="case-card-header">
            <div className="case-card-icon">
              ◉
            </div>

            <div>
              <p className="case-section-label">
                PEOPLE
              </p>

              <h2>People Involved</h2>

              <p>
                Individuals mentioned in the complaint.
              </p>
            </div>
          </div>

          {people && people.length > 0 ? (
            <div className="case-people-list">

              {people.map((person, index) => (
                <div
                  key={person.id}
                  className="case-person-card"
                >

                  <div className="case-person-header">
                    <div>
                      <span>
                        PERSON {index + 1}
                      </span>

                      <h3>
                        {person.full_name ||
                          "Unnamed Person"}
                      </h3>
                    </div>

                    {person.involved_type && (
                      <span className="case-person-type">
                        {person.involved_type}
                      </span>
                    )}
                  </div>

                  <div className="case-info-grid">

                    {person.alias && (
                      <div className="case-info-item">
                        <span>Alias</span>
                        <strong>
                          {person.alias}
                        </strong>
                      </div>
                    )}

                    {person.contact && (
                      <div className="case-info-item">
                        <span>Contact</span>
                        <strong>
                          {person.contact}
                        </strong>
                      </div>
                    )}

                    {person.age && (
                      <div className="case-info-item">
                        <span>Age</span>
                        <strong>
                          {person.age}
                        </strong>
                      </div>
                    )}

                    {person.relationship && (
                      <div className="case-info-item">
                        <span>Relationship</span>
                        <strong>
                          {person.relationship}
                        </strong>
                      </div>
                    )}

                    {person.known_from && (
                      <div className="case-info-item">
                        <span>Known From</span>
                        <strong>
                          {person.known_from}
                        </strong>
                      </div>
                    )}

                    {person.position_of_power && (
                      <div className="case-info-item">
                        <span>Position of Power</span>
                        <strong>
                          {person.position_of_power}
                        </strong>
                      </div>
                    )}

                  </div>

                  {person.address && (
                    <div className="case-text-block">
                      <span>Address</span>

                      <p>{person.address}</p>
                    </div>
                  )}

                  {person.other_information && (
                    <div className="case-text-block">
                      <span>Other Information</span>

                      <p>
                        {person.other_information}
                      </p>
                    </div>
                  )}

                </div>
              ))}

            </div>
          ) : (
            <div className="case-empty-state">
              <span>○</span>

              <p>
                No people information was provided
                with this complaint.
              </p>
            </div>
          )}

        </section>

        {/* ───────────── EVIDENCE ───────────── */}
        <section className="case-card">

          <div className="case-card-header">
            <div className="case-card-icon">
              ▣
            </div>

            <div>
              <p className="case-section-label">
                DOCUMENTS
              </p>

              <h2>Evidence & Documents</h2>

              <p>
                Files and supporting evidence submitted
                with the complaint.
              </p>
            </div>
          </div>

          {evidence && evidence.length > 0 ? (
            <div className="case-evidence-list">

              {evidence.map((item) => (
                <EvidenceViewer
                  key={item.id}
                  evidenceId={item.id}
                  fileName={item.file_name}
                  fileType={item.file_type}
                />
              ))}

            </div>
          ) : (
            <div className="case-empty-state">
              <span>□</span>

              <p>
                No evidence was submitted with this
                complaint.
              </p>
            </div>
          )}

        </section>

      </div>
    </main>
  );
}