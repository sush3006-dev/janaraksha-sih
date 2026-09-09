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
      .select(
        `
          id,
          complaint_id,
          file_name,
          file_size,
          file_type,
          evidence_type,
          storage_path,
          uploaded_at
        `
      )
      .eq("complaint_id", id)
      .order("uploaded_at", { ascending: true });

  if (evidenceError) {
    console.error(
      "Complaint evidence error:",
      evidenceError
    );
  }

  return (
    <main className="dashboard">
      <Sidebar activeItem="Complaints" />

      <div className="dashboard-content">

        {/* Header */}
        <div className="complaint-details-header">
          <div>
            <Link
              href="/authority/complaints"
              className="back-link"
            >
              ← Back to Complaints
            </Link>

            <p className="authority-complaint-number">
              {complaint.complaint_number}
            </p>

            <h1>Complaint Details</h1>
          </div>

          <span
            className={`authority-status-badge status-${complaint.status.toLowerCase()}`}
          >
            {complaint.status}
          </span>
        </div>

        {/* Basic Information */}
        <section className="complaint-details-card">
          <div className="complaint-details-card-header">
            <div>
              <p className="authority-section-eyebrow">
                Complaint Information
              </p>

              <h2>Basic Information</h2>
            </div>

            <span className="complaint-priority">
              Priority: {complaint.priority}
            </span>
          </div>

          <div className="complaint-details-grid">
            <div className="complaint-detail-field">
              <span>Complaint Number</span>

              <strong>
                {complaint.complaint_number}
              </strong>
            </div>

            <div className="complaint-detail-field">
              <span>Category</span>

              <strong>{complaint.category}</strong>
            </div>

            <div className="complaint-detail-field">
              <span>Status</span>

              <strong>{complaint.status}</strong>
            </div>

            <div className="complaint-detail-field">
              <span>Priority</span>

              <strong>{complaint.priority}</strong>
            </div>

            <div className="complaint-detail-field">
              <span>Submitted On</span>

              <strong>
                {new Date(
                  complaint.created_at
                ).toLocaleString()}
              </strong>
            </div>
          </div>

          <div className="complaint-detail-description">
            <span>Complaint Description</span>

            <p>{complaint.description}</p>
          </div>

          {/* Assignment Action */}
          {complaint.status === "SUBMITTED" && (
            <div className="complaint-assignment-action">
              <AssignComplaintButton
                complaintId={complaint.id}
              />
            </div>
          )}

          {complaint.status === "ASSIGNED" && (
            <div className="complaint-assigned-message">
              This complaint has been assigned and is now under review.
            </div>
          )}
        </section>

        {/* Incident Details */}
        <section className="complaint-details-card">
          <div className="complaint-details-card-header">
            <div>
              <p className="authority-section-eyebrow">
                Incident
              </p>

              <h2>Incident Details</h2>
            </div>
          </div>

          <div className="complaint-details-grid">
            <div className="complaint-detail-field">
              <span>Incident Date</span>

              <strong>
                {complaint.incident_date ||
                  "Not provided"}
              </strong>
            </div>

            <div className="complaint-detail-field">
              <span>Incident Time</span>

              <strong>
                {complaint.time_not_known
                  ? "Time not known"
                  : complaint.incident_time ||
                    "Not provided"}
              </strong>
            </div>

            <div className="complaint-detail-field">
              <span>Frequency</span>

              <strong>
                {complaint.frequency ||
                  "Not provided"}
              </strong>
            </div>

            <div className="complaint-detail-field">
              <span>Immediate Danger</span>

              <strong>
                {complaint.immediate_danger
                  ? "Yes"
                  : "No"}
              </strong>
            </div>

            <div className="complaint-detail-field">
              <span>Incident Methods</span>

              <strong>
                {complaint.incident_methods ||
                  "Not provided"}
              </strong>
            </div>
          </div>

          {complaint.detailed_description && (
            <div className="complaint-detail-description">
              <span>Detailed Description</span>

              <p>
                {complaint.detailed_description}
              </p>
            </div>
          )}
        </section>

        {/* Location */}
        <section className="complaint-details-card">
          <div className="complaint-details-card-header">
            <div>
              <p className="authority-section-eyebrow">
                Location
              </p>

              <h2>Incident Location</h2>
            </div>
          </div>

          <div className="complaint-details-grid">
            <div className="complaint-detail-field complaint-detail-wide">
              <span>Address</span>

              <strong>
                {complaint.location_address ||
                  "Not provided"}
              </strong>
            </div>

            <div className="complaint-detail-field">
              <span>City / District</span>

              <strong>
                {complaint.city_district ||
                  "Not provided"}
              </strong>
            </div>

            <div className="complaint-detail-field">
              <span>Latitude</span>

              <strong>
                {complaint.latitude ??
                  "Not available"}
              </strong>
            </div>

            <div className="complaint-detail-field">
              <span>Longitude</span>

              <strong>
                {complaint.longitude ??
                  "Not available"}
              </strong>
            </div>
          </div>
        </section>

        {/* People Involved */}
        <section className="complaint-details-card">
          <div className="complaint-details-card-header">
            <div>
              <p className="authority-section-eyebrow">
                People
              </p>

              <h2>People Involved</h2>
            </div>
          </div>

          {people && people.length > 0 ? (
            <div className="authority-people-list">
              {people.map((person, index) => (
                <div
                  key={person.id}
                  className="authority-person-card"
                >
                  <div className="authority-person-header">
                    <h3>Person {index + 1}</h3>

                    {person.involved_type && (
                      <span>
                        {person.involved_type}
                      </span>
                    )}
                  </div>

                  <div className="complaint-details-grid">
                    {person.full_name && (
                      <div className="complaint-detail-field">
                        <span>Name</span>

                        <strong>
                          {person.full_name}
                        </strong>
                      </div>
                    )}

                    {person.alias && (
                      <div className="complaint-detail-field">
                        <span>Alias</span>

                        <strong>
                          {person.alias}
                        </strong>
                      </div>
                    )}

                    {person.contact && (
                      <div className="complaint-detail-field">
                        <span>Contact</span>

                        <strong>
                          {person.contact}
                        </strong>
                      </div>
                    )}

                    {person.age && (
                      <div className="complaint-detail-field">
                        <span>Age</span>

                        <strong>
                          {person.age}
                        </strong>
                      </div>
                    )}

                    {person.relationship && (
                      <div className="complaint-detail-field">
                        <span>Relationship</span>

                        <strong>
                          {person.relationship}
                        </strong>
                      </div>
                    )}

                    {person.known_from && (
                      <div className="complaint-detail-field">
                        <span>Known From</span>

                        <strong>
                          {person.known_from}
                        </strong>
                      </div>
                    )}

                    {person.position_of_power && (
                      <div className="complaint-detail-field complaint-detail-wide">
                        <span>
                          Position of Power
                        </span>

                        <strong>
                          {person.position_of_power}
                        </strong>
                      </div>
                    )}

                    {person.address && (
                      <div className="complaint-detail-field complaint-detail-wide">
                        <span>Address</span>

                        <strong>
                          {person.address}
                        </strong>
                      </div>
                    )}

                    {person.other_information && (
                      <div className="complaint-detail-description complaint-detail-wide">
                        <span>
                          Other Information
                        </span>

                        <p>
                          {person.other_information}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="authority-muted-text">
              No people information was provided.
            </p>
          )}
        </section>

        {/* Evidence & Documents */}
        <section className="complaint-details-card">
          <div className="complaint-details-card-header">
            <div>
              <p className="authority-section-eyebrow">
                Documents
              </p>

              <h2>Evidence & Documents</h2>
            </div>
          </div>

          {evidence && evidence.length > 0 ? (
            <div className="authority-evidence-list">
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
            <p className="authority-muted-text">
              No evidence was submitted.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}