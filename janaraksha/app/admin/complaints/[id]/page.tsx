import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/dashboard/Sidebar";

type AdminComplaintDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminComplaintDetailsPage({
  params,
}: AdminComplaintDetailsPageProps) {
  const { id } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: adminProfile, error: adminProfileError } =
    await supabase
      .from("profiles")
      .select("full_name, role")
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

  const { data: complaint, error: complaintError } =
    await supabase
      .from("complaints")
      .select("*")
      .eq("id", id)
      .single();

  if (complaintError || !complaint) {
    notFound();
  }

  const { data: citizen } = await supabase
    .from("profiles")
    .select(
      "id, full_name, email, phone, account_status"
    )
    .eq("id", complaint.user_id)
    .single();

  let assignedAuthority = null;

  if (complaint.assigned_authority_id) {
    const { data: authority } = await supabase
      .from("profiles")
      .select(
        "id, full_name, email, account_status"
      )
      .eq("id", complaint.assigned_authority_id)
      .single();

    assignedAuthority = authority;
  }

  const { data: people } = await supabase
    .from("complaint_people")
    .select("*")
    .eq("complaint_id", id)
    .order("created_at", {
      ascending: true,
    });

  const { data: evidence } = await supabase
    .from("complaint_evidence")
    .select("*")
    .eq("complaint_id", id)
    .order("uploaded_at", {
      ascending: true,
    });

  const submittedDate = new Date(
    complaint.created_at
  ).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const incidentDate = complaint.incident_date
    ? new Date(
        `${complaint.incident_date}T00:00:00`
      ).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "Not provided";

  return (
    <main className="dashboard">
      <Sidebar activeItem="Complaints" />

      <div className="dashboard-content">
        <header className="authority-dashboard-header">
          <div className="authority-welcome">
            <p className="authority-eyebrow">
              JanaRaksha Admin Portal
            </p>

            <h1>Complaint Details</h1>

            <p className="authority-description">
              View complete complaint information and
              related account activity.
            </p>
          </div>

          <div className="authority-header-actions">
            <Link
              href="/admin/complaints"
              className="admin-view-button"
            >
              ← Back to Complaints
            </Link>

            <Link
              href="/admin/profile"
              className="profile-button"
            >
              <span className="profile-icon">
                ●
              </span>

              <span>Profile</span>
            </Link>
          </div>
        </header>

        {/* COMPLAINT SUMMARY */}
        <section className="profile-section-card">
          <div className="profile-section-header">
            <div>
              <p className="case-section-label">
                COMPLAINT SUMMARY
              </p>

              <h2>{complaint.complaint_number}</h2>

              <p>
                Submitted on {submittedDate}
              </p>
            </div>
          </div>

          <div className="profile-info-list">
            <div className="profile-info-row">
              <span>Category</span>
              <strong>{complaint.category}</strong>
            </div>

            <div className="profile-info-row">
              <span>Status</span>
              <strong>{complaint.status}</strong>
            </div>

            <div className="profile-info-row">
              <span>Priority</span>
              <strong>{complaint.priority}</strong>
            </div>

            <div className="profile-info-row">
              <span>Incident Date</span>
              <strong>{incidentDate}</strong>
            </div>

            <div className="profile-info-row">
              <span>Incident Time</span>
              <strong>
                {complaint.time_not_known
                  ? "Time not known"
                  : complaint.incident_time ||
                    "Not provided"}
              </strong>
            </div>

            <div className="profile-info-row">
              <span>Incident Location</span>
              <strong>
                {complaint.location_address ||
                  "Not provided"}
              </strong>
            </div>

            <div className="profile-info-row">
              <span>City / District</span>
              <strong>
                {complaint.city_district ||
                  "Not provided"}
              </strong>
            </div>

            <div className="profile-info-row">
              <span>Immediate Danger</span>
              <strong>
                {complaint.immediate_danger
                  ? "Yes"
                  : "No"}
              </strong>
            </div>
          </div>
        </section>

        {/* INCIDENT DETAILS */}
        <section className="profile-section-card">
          <div className="profile-section-header">
            <div>
              <p className="case-section-label">
                INCIDENT INFORMATION
              </p>

              <h2>Incident Details</h2>
            </div>
          </div>

          <div className="profile-info-list">
            <div className="profile-info-row">
              <span>Methods Involved</span>
              <strong>
                {complaint.incident_methods ||
                  "Not provided"}
              </strong>
            </div>

            <div className="profile-info-row">
              <span>Frequency</span>
              <strong>
                {complaint.frequency ||
                  "Not provided"}
              </strong>
            </div>
          </div>

          <div className="case-description-block">
            <h3>Description</h3>

            <p>
              {complaint.description ||
                "No description provided."}
            </p>
          </div>

          {complaint.detailed_description && (
            <div className="case-description-block">
              <h3>Detailed Description</h3>

              <p>
                {complaint.detailed_description}
              </p>
            </div>
          )}
        </section>

        {/* CITIZEN INFORMATION */}
        <section className="profile-section-card">
          <div className="profile-section-header">
            <div>
              <p className="case-section-label">
                CITIZEN INFORMATION
              </p>

              <h2>Submitted By</h2>
            </div>
          </div>

          <div className="profile-info-list">
            <div className="profile-info-row">
              <span>Full Name</span>
              <strong>
                {citizen?.full_name ||
                  "Not available"}
              </strong>
            </div>

            <div className="profile-info-row">
              <span>Email Address</span>
              <strong>
                {citizen?.email ||
                  "Not available"}
              </strong>
            </div>

            <div className="profile-info-row">
              <span>Phone Number</span>
              <strong>
                {citizen?.phone ||
                  "Not provided"}
              </strong>
            </div>

            <div className="profile-info-row">
              <span>Account Status</span>
              <strong>
                {citizen?.account_status ||
                  "Not available"}
              </strong>
            </div>
          </div>
        </section>

        {/* ASSIGNED AUTHORITY */}
        <section className="profile-section-card">
          <div className="profile-section-header">
            <div>
              <p className="case-section-label">
                ASSIGNMENT INFORMATION
              </p>

              <h2>Assigned Authority</h2>
            </div>
          </div>

          <div className="profile-info-list">
            <div className="profile-info-row">
              <span>Authority Name</span>
              <strong>
                {assignedAuthority?.full_name ||
                  "Not assigned"}
              </strong>
            </div>

            <div className="profile-info-row">
              <span>Authority Email</span>
              <strong>
                {assignedAuthority?.email ||
                  "Not available"}
              </strong>
            </div>

            <div className="profile-info-row">
              <span>Authority Status</span>
              <strong>
                {assignedAuthority?.account_status ||
                  "Not available"}
              </strong>
            </div>
          </div>
        </section>

        {/* INVOLVED PEOPLE */}
        <section className="profile-section-card">
          <div className="profile-section-header">
            <div>
              <p className="case-section-label">
                PEOPLE AND INFORMATION
              </p>

              <h2>Involved People</h2>
            </div>
          </div>

          {people && people.length > 0 ? (
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
                      <td>
                        {person.full_name ||
                          "Not provided"}
                      </td>

                      <td>
                        {person.involved_type ||
                          "Not provided"}
                      </td>

                      <td>
                        {person.alias ||
                          "Not provided"}
                      </td>

                      <td>
                        {person.contact ||
                          "Not provided"}
                      </td>

                      <td>
                        {person.relationship ||
                          "Not provided"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="admin-empty-state">
              <h3>No involved people added</h3>

              <p>
                No additional people were recorded
                for this complaint.
              </p>
            </div>
          )}
        </section>

        {/* EVIDENCE */}
        <section className="profile-section-card">
          <div className="profile-section-header">
            <div>
              <p className="case-section-label">
                EVIDENCE AND DOCUMENTS
              </p>

              <h2>Evidence</h2>
            </div>
          </div>

          {evidence && evidence.length > 0 ? (
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
                        <strong>
                          {file.file_name}
                        </strong>
                      </td>

                      <td>
                        {file.file_type ||
                          "Not provided"}
                      </td>

                      <td>
                        {file.evidence_type ||
                          "Not provided"}
                      </td>

                      <td>
                        {new Date(
                          file.uploaded_at
                        ).toLocaleDateString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="admin-empty-state">
              <h3>No evidence uploaded</h3>

              <p>
                No evidence files were attached to
                this complaint.
              </p>
            </div>
          )}
        </section>

        {/* RESOLUTION */}
        {complaint.status === "CLOSED" && (
          <section className="profile-section-card">
            <div className="profile-section-header">
              <div>
                <p className="case-section-label">
                  RESOLUTION
                </p>

                <h2>Resolution Summary</h2>
              </div>
            </div>

            <div className="case-description-block">
              <p>
                {complaint.resolution_summary ||
                  "No resolution summary provided."}
              </p>
            </div>

            {complaint.closed_at && (
              <div className="profile-info-list">
                <div className="profile-info-row">
                  <span>Closed On</span>

                  <strong>
                    {new Date(
                      complaint.closed_at
                    ).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </strong>
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}