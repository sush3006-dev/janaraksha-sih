"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import { createClient } from "@/lib/supabase/client";
import {
  deleteEvidenceFile,
  getEvidenceFile,
} from "@/lib/complaint-evidence";

type Person = {
  involved_type?: string;
  full_name?: string;
  alias?: string;
  contact?: string;
  age?: string;
  address?: string;
  relationship?: string;
  known_from?: string;
  position_of_power?: string;
  other_information?: string;
};

type Evidence = {
  id?: string;
  file_name?: string;
  file_size?: number;
  file_type?: string;
  evidence_type?: string;
};

type ComplaintDraft = {
  category?: string;
  description?: string;

  incident_date?: string;
  incident_time?: string;
  time_not_known?: boolean;

  incident_methods?: string;
  detailed_description?: string;
  frequency?: string;
  immediate_danger?: boolean;

  location_address?: string;
  city_district?: string;
  latitude?: number;
  longitude?: number;
  location_accuracy?: number;

  people?: Person[];
  evidence?: Evidence[];
};

type Profile = {
  full_name: string | null;
  email: string | null;
};

export default function ReviewPage() {
  const router = useRouter();
  const supabase = createClient();

  const [draft, setDraft] =
    useState<ComplaintDraft | null>(null);

  const [profile, setProfile] =
    useState<Profile | null>(null);

  const [declarationAccepted, setDeclarationAccepted] =
    useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [removingEvidenceId, setRemovingEvidenceId] =
    useState<string | null>(null);

  const [submitting, setSubmitting] =
    useState(false);

  const [submittedComplaintNumber, setSubmittedComplaintNumber] =
    useState<string | null>(null);

  useEffect(() => {
    async function loadReviewData() {
      const storedDraft = sessionStorage.getItem(
        "janaraksha-complaint-draft"
      );

      if (!storedDraft) {
        router.replace("/user/register-complaint");
        return;
      }

      try {
        const parsedDraft =
          JSON.parse(storedDraft) as ComplaintDraft;

        setDraft(parsedDraft);

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.replace("/auth/login");
          return;
        }

        const { data: profileData } =
          await supabase
            .from("profiles")
            .select("full_name, email")
            .eq("id", user.id)
            .single();

        if (profileData) {
          setProfile(profileData);
        }
      } catch (loadError) {
        console.error(
          "Review loading error:",
          loadError
        );

        setError(
          "Unable to load complaint information."
        );
      } finally {
        setLoading(false);
      }
    }

    loadReviewData();
  }, [router, supabase]);

  function handleEdit(path: string) {
    router.push(path);
  }

  async function handleRemoveEvidence(
    evidenceId: string
  ) {
    if (!draft) {
      return;
    }

    setError("");
    setRemovingEvidenceId(evidenceId);

    try {
      await deleteEvidenceFile(evidenceId);

      const updatedEvidence =
        (draft.evidence || []).filter(
          (item) => item.id !== evidenceId
        );

      const updatedDraft: ComplaintDraft = {
        ...draft,
        evidence: updatedEvidence,
      };

      setDraft(updatedDraft);

      sessionStorage.setItem(
        "janaraksha-complaint-draft",
        JSON.stringify(updatedDraft)
      );
    } catch (removeError) {
      console.error(
        "Evidence removal error:",
        removeError
      );

      setError(
        "Unable to remove this evidence. Please try again."
      );
    } finally {
      setRemovingEvidenceId(null);
    }
  }

  async function handleSubmit() {
    if (!declarationAccepted) {
      setError(
        "Please accept the declaration before submitting."
      );
      return;
    }

    if (!draft) {
      setError(
        "Complaint information could not be found."
      );
      return;
    }

    if (submitting) {
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      /*
       * =========================================
       * 1. CREATE FORM DATA
       * =========================================
       *
       * We use FormData because evidence files
       * are actual File objects.
       */

      const formData = new FormData();

      /*
       * =========================================
       * 2. ADD COMPLAINT INFORMATION
       * =========================================
       */

      formData.append(
        "category",
        draft.category || ""
      );

      formData.append(
        "description",
        draft.description || ""
      );

      formData.append(
        "incidentDate",
        draft.incident_date || ""
      );

      formData.append(
        "incidentTime",
        draft.incident_time || ""
      );

      formData.append(
        "timeNotKnown",
        String(
          draft.time_not_known ?? false
        )
      );

      formData.append(
        "incidentMethods",
        draft.incident_methods || ""
      );

      formData.append(
        "detailedDescription",
        draft.detailed_description || ""
      );

      formData.append(
        "frequency",
        draft.frequency || ""
      );

      formData.append(
        "immediateDanger",
        String(
          draft.immediate_danger ?? false
        )
      );

      formData.append(
        "locationAddress",
        draft.location_address || ""
      );

      formData.append(
        "cityDistrict",
        draft.city_district || ""
      );

      if (
        draft.latitude !== undefined
      ) {
        formData.append(
          "latitude",
          String(draft.latitude)
        );
      }

      if (
        draft.longitude !== undefined
      ) {
        formData.append(
          "longitude",
          String(draft.longitude)
        );
      }

      if (
        draft.location_accuracy !==
        undefined
      ) {
        formData.append(
          "locationAccuracy",
          String(
            draft.location_accuracy
          )
        );
      }

      /*
       * =========================================
       * 3. ADD PEOPLE
       * =========================================
       */

      formData.append(
        "people",
        JSON.stringify(
          draft.people || []
        )
      );

      /*
       * =========================================
       * 4. GET ACTUAL FILES FROM INDEXED DB
       * =========================================
       */

      const evidence =
        draft.evidence || [];

      for (const evidenceItem of evidence) {
        if (!evidenceItem.id) {
          continue;
        }

        const file =
          await getEvidenceFile(
            evidenceItem.id
          );

        if (!file) {
          throw new Error(
            `Unable to load evidence file: ${evidenceItem.file_name ||
            "Unknown file"
            }`
          );
        }

        /*
         * "evidence" is the field name
         * expected by the API.
         */

        formData.append(
          "evidence",
          file,
          file.name
        );
      }

      /*
       * =========================================
       * 5. SUBMIT EVERYTHING
       * =========================================
       *
       * IMPORTANT:
       * Do NOT manually set Content-Type.
       * Browser automatically creates the
       * multipart/form-data boundary.
       */

      const response = await fetch(
        "/api/complaints/submit",
        {
          method: "POST",
          body: formData,
        }
      );

      const result =
        await response.json();

      /*
       * =========================================
       * 6. HANDLE API ERROR
       * =========================================
       */

      if (!response.ok) {
        throw new Error(
          result.error ||
          "Unable to submit the complaint."
        );
      }

      /*
       * =========================================
       * 7. GET COMPLAINT NUMBER
       * =========================================
       */

      const complaintNumber =
        result?.complaint?.complaint_number;

      if (!complaintNumber) {
        throw new Error(
          "Complaint was created but the complaint number was not received."
        );
      }

      /*
       * =========================================
       * 8. SHOW SUCCESS
       * =========================================
       */

      setSubmittedComplaintNumber(
        complaintNumber
      );

      /*
       * =========================================
       * 9. CLEAR LOCAL EVIDENCE FILES
       * =========================================
       *
       * Only clear IndexedDB AFTER the server
       * confirms successful submission.
       */

      for (const evidenceItem of evidence) {
        if (evidenceItem.id) {
          try {
            await deleteEvidenceFile(
              evidenceItem.id
            );
          } catch (cleanupError) {
            console.error(
              "Evidence cleanup error:",
              cleanupError
            );
          }
        }
      }

      /*
       * Clear the temporary complaint draft
       * because submission is complete.
       */

      sessionStorage.removeItem(
        "janaraksha-complaint-draft"
      );
    } catch (submitError) {
      console.error(
        "Complaint submission error:",
        submitError
      );

      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to submit the complaint. Please check the server logs."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="dashboard">
        <Sidebar activeItem="Register Complaint" />

        <section className="dashboard-content">
          <p>Loading complaint...</p>
        </section>
      </main>
    );
  }

  if (!draft) {
    return (
      <main className="dashboard">
        <Sidebar activeItem="Register Complaint" />

        <section className="dashboard-content">
          <p className="form-error">
            {error ||
              "Complaint could not be loaded."}
          </p>
        </section>
      </main>
    );
  }

  const people =
    draft.people || [];

  const evidence =
    draft.evidence || [];

  const displayName =
    profile?.full_name ||
    "Not available";

  const displayEmail =
    profile?.email ||
    "Not available";

  return (
    <main className="dashboard">
      <Sidebar activeItem="Register Complaint" />

      <section className="dashboard-content">
        <header className="dashboard-header">
          <div>
            <p className="page-label">
              STEP 5 OF 5
            </p>

            <h1>Review & Submit</h1>

            <p className="header-description">
              Please review all your information carefully
              before submitting your complaint.
            </p>
          </div>
        </header>

        <section className="complaint-form-card review-card">

          {/* INCIDENT TYPE */}

          <div className="review-card-section">
            <div className="review-card-heading">
              <div>
                <span className="review-step-number">
                  1
                </span>

                <div>
                  <h2>Incident Type</h2>

                  <p>
                    {draft.category ||
                      "Not provided"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="edit-button"
                onClick={() =>
                  handleEdit(
                    "/user/register-complaint"
                  )
                }
              >
                ✎ Edit
              </button>
            </div>

            <div className="review-summary-text">
              {draft.description ||
                "No incident description provided."}
            </div>
          </div>

          {/* INCIDENT DETAILS */}

          <div className="review-card-section">
            <div className="review-card-heading">
              <div>
                <span className="review-step-number">
                  2
                </span>

                <div>
                  <h2>Incident Details</h2>
                </div>
              </div>

              <button
                type="button"
                className="edit-button"
                onClick={() =>
                  handleEdit(
                    "/user/register-complaint/details"
                  )
                }
              >
                ✎ Edit
              </button>
            </div>

            <div className="review-grid">
              <div className="review-detail">
                <span>Date of Incident</span>

                <strong>
                  {draft.incident_date ||
                    "Not provided"}
                </strong>
              </div>

              <div className="review-detail">
                <span>Time of Incident</span>

                <strong>
                  {draft.time_not_known
                    ? "Time not known"
                    : draft.incident_time ||
                    "Not provided"}
                </strong>
              </div>

              <div className="review-detail">
                <span>City / District</span>

                <strong>
                  {draft.city_district ||
                    "Not provided"}
                </strong>
              </div>

              <div className="review-detail">
                <span>Where it happened</span>

                <strong>
                  {draft.location_address ||
                    "Not provided"}
                </strong>
              </div>

              <div className="review-detail">
                <span>How it happened</span>

                <strong>
                  {draft.incident_methods ||
                    "Not provided"}
                </strong>
              </div>

              <div className="review-detail">
                <span>How often</span>

                <strong>
                  {draft.frequency ||
                    "Not provided"}
                </strong>
              </div>

              <div className="review-detail">
                <span>Immediate Danger</span>

                <strong>
                  {draft.immediate_danger
                    ? "Yes"
                    : "No"}
                </strong>
              </div>
            </div>

            {draft.detailed_description && (
              <div className="review-summary-text">
                <span>
                  Detailed Description
                </span>

                <p>
                  {draft.detailed_description}
                </p>
              </div>
            )}
          </div>

          {/* PEOPLE */}

          <div className="review-card-section">
            <div className="review-card-heading">
              <div>
                <span className="review-step-number">
                  3
                </span>

                <div>
                  <h2>
                    People & Information
                  </h2>

                  <p>
                    {people.length === 0
                      ? "No people added"
                      : `${people.length} ${people.length === 1
                        ? "person"
                        : "people"
                      } added`}
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="edit-button"
                onClick={() =>
                  handleEdit(
                    "/user/register-complaint/people"
                  )
                }
              >
                ✎ Edit
              </button>
            </div>

            {people.length > 0 && (
              <div className="review-person-list">
                {people.map(
                  (person, index) => (
                    <div
                      key={`${person.full_name}-${index}`}
                      className="review-person-summary"
                    >
                      <strong>
                        {person.full_name ||
                          `Person ${index + 1}`}
                      </strong>

                      <span>
                        {person.involved_type ||
                          "Type not provided"}
                      </span>

                      {person.relationship && (
                        <span>
                          Relationship:{" "}
                          {
                            person.relationship
                          }
                        </span>
                      )}
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          {/* EVIDENCE */}

          <div className="review-card-section">
            <div className="review-card-heading">
              <div>
                <span className="review-step-number">
                  4
                </span>

                <div>
                  <h2>
                    Evidence & Documents
                  </h2>

                  <p>
                    {evidence.length === 0
                      ? "No evidence added"
                      : `${evidence.length} ${evidence.length === 1
                        ? "file"
                        : "files"
                      } selected`}
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="edit-button"
                onClick={() =>
                  handleEdit(
                    "/user/register-complaint/evidence"
                  )
                }
              >
                ✎ Edit
              </button>
            </div>

            {evidence.length === 0 ? (
              <div className="review-summary-text">
                <p>
                  No evidence or documents
                  provided.
                </p>
              </div>
            ) : (
              <div className="review-evidence-summary">
                {evidence.map(
                  (item, index) => {
                    const evidenceId =
                      item.id ||
                      `evidence-${index}`;

                    const isRemoving =
                      removingEvidenceId ===
                      evidenceId;

                    return (
                      <div
                        key={evidenceId}
                        className="review-evidence-row"
                      >
                        <div>
                          <span>
                            {item.file_name ||
                              "Unnamed file"}
                          </span>

                          <small>
                            {item.evidence_type ||
                              "Other"}

                            {item.file_size
                              ? ` · ${Math.ceil(
                                item.file_size /
                                1024
                              )} KB`
                              : ""}
                          </small>
                        </div>

                        <button
                          type="button"
                          className="edit-button"
                          onClick={() =>
                            handleRemoveEvidence(
                              evidenceId
                            )
                          }
                          disabled={
                            isRemoving
                          }
                        >
                          {isRemoving
                            ? "Removing..."
                            : "Remove"}
                        </button>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </div>

          {/* YOUR INFORMATION */}

          <div className="review-card-section">
            <div className="review-card-heading">
              <div>
                <span className="review-step-number">
                  5
                </span>

                <div>
                  <h2>Your Information</h2>

                  <p>
                    Complaint will be submitted using
                    this account.
                  </p>
                </div>
              </div>
            </div>

            <div className="review-grid">
              <div className="review-detail">
                <span>Name</span>

                <strong>
                  {displayName}
                </strong>
              </div>

              <div className="review-detail">
                <span>Email</span>

                <strong>
                  {displayEmail}
                </strong>
              </div>
            </div>
          </div>

          {/* DECLARATION */}

          <div className="declaration-box">
            <div className="declaration-icon">
              ✓
            </div>

            <div className="declaration-content">
              <h2>Declaration</h2>

              <p>
                I confirm that the information provided
                above is true and correct to the best of
                my knowledge and belief.
              </p>

              <p>
                I understand that providing false
                information may lead to legal action.
              </p>
            </div>

            <label className="declaration-checkbox">
              <input
                type="checkbox"
                checked={declarationAccepted}
                disabled={
                  submittedComplaintNumber !== null
                }
                onChange={(event) => {
                  setDeclarationAccepted(
                    event.target.checked
                  );

                  setError("");
                }}
              />

              <span>
                I agree to the above declaration
              </span>
            </label>
          </div>

          {/* PRIVACY */}

          <div className="privacy-box">
            <div className="privacy-icon">
              🔒
            </div>

            <div>
              <strong>
                Your privacy is important to us.
              </strong>

              <p>
                Your information and documents will be
                kept confidential and used only for
                addressing your complaint.
              </p>
            </div>
          </div>

          {/* SUCCESS */}

          {submittedComplaintNumber && (
            <div className="declaration-box">
              <div className="declaration-icon">
                ✓
              </div>

              <div className="declaration-content">
                <h2>
                  Complaint Submitted Successfully
                </h2>

                <p>
                  Your complaint has been registered
                  successfully.
                </p>

                <p>
                  Complaint Number:{" "}
                  <strong>
                    {submittedComplaintNumber}
                  </strong>
                </p>
              </div>
            </div>
          )}

          {/* ERROR */}

          {error && (
            <p className="form-error">
              {error}
            </p>
          )}

          {/* ACTIONS */}

          <div className="review-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={() =>
                router.push(
                  "/user/register-complaint/evidence"
                )
              }
              disabled={submitting}
            >
              ← Back
            </button>

            <button
              type="button"
              className="primary-button submit-button"
              onClick={handleSubmit}
              disabled={
                !declarationAccepted ||
                submitting ||
                submittedComplaintNumber !== null
              }
            >
              {submitting
                ? "Submitting..."
                : submittedComplaintNumber
                  ? "Complaint Submitted"
                  : "Submit Complaint"}

              {!submitting &&
                !submittedComplaintNumber && (
                  <span>→</span>
                )}
            </button>
          </div>
        </section>
      </section>
    </main>
  );
}