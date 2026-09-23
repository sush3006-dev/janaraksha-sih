"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

type ComplaintStatus =
  | "SUBMITTED"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "DONE"
  | "UNDER_VERIFICATION"
  | "REOPENED"
  | "CLOSED";

type CitizenSatisfaction =
  | "SATISFIED"
  | "NOT_SATISFIED"
  | null;

type AdminComplaintActionButtonProps = {
  complaintId: string;
  currentStatus: ComplaintStatus;

  citizenSatisfaction: CitizenSatisfaction;
  citizenFeedback: string | null;
  citizenRespondedAt: string | null;
  resolutionSummary: string | null;
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

export default function AdminComplaintActionButton({
  complaintId,
  currentStatus,
  citizenSatisfaction,
  citizenFeedback,
  citizenRespondedAt,
  resolutionSummary,
}: AdminComplaintActionButtonProps) {
  const router = useRouter();

  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleVerification(
    action: "CLOSE" | "REOPEN",
  ) {
    if (!citizenSatisfaction) {
      setError(
        "Citizen response is required before verification.",
      );

      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // ================================================
      // GET CURRENT ADMIN USER
      // ================================================

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error(
          "You must be logged in as an administrator.",
        );
      }

      // ================================================
      // VERIFY ADMIN ROLE
      // ================================================

      const { data: profile, error: profileError } =
        await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

      if (profileError || !profile) {
        throw new Error(
          "Unable to verify administrator account.",
        );
      }

      if (profile.role !== "SUPER_ADMIN") {
        throw new Error(
          "Only a Super Admin can verify this complaint.",
        );
      }

      // ================================================
      // CHECK CURRENT COMPLAINT STATUS
      // ================================================

      if (
        currentStatus !== "DONE" &&
        currentStatus !== "UNDER_VERIFICATION"
      ) {
        throw new Error(
          `This complaint cannot be verified while its status is ${currentStatus}.`,
        );
      }

      // ================================================
      // PREPARE NEW STATUS
      // ================================================

      const newStatus: ComplaintStatus =
        action === "CLOSE"
          ? "CLOSED"
          : "REOPENED";

      const now = new Date().toISOString();

      // ================================================
      // UPDATE COMPLAINT
      // ================================================

      const { data, error: updateError } =
        await supabase
          .from("complaints")
          .update({
            status: newStatus,

            verified_by: user.id,

            verified_at: now,

            closed_at:
              action === "CLOSE"
                ? now
                : null,

            closed_by:
              action === "CLOSE"
                ? user.id
                : null,

            updated_at: now,
          })
          .eq("id", complaintId)
          .in("status", [
            "DONE",
            "UNDER_VERIFICATION",
          ])
          .select(
            `
              id,
              status,
              verified_by,
              verified_at,
              closed_at,
              closed_by
            `,
          )
          .maybeSingle();

      if (updateError) {
        console.error(
          "Admin verification update error:",
          updateError,
        );

        throw new Error(updateError.message);
      }

      if (!data) {
        throw new Error(
          "The complaint could not be updated. Check the complaint status and Admin RLS policy.",
        );
      }

      // ================================================
      // SUCCESS MESSAGE
      // ================================================

      if (action === "CLOSE") {
        setSuccess(
          "Complaint has been verified and closed successfully.",
        );
      } else {
        setSuccess(
          "Complaint has been reopened successfully.",
        );
      }

      // ================================================
      // REFRESH PAGE
      // ================================================

      setTimeout(() => {
        router.refresh();
      }, 1000);

    } catch (verificationError) {
      console.error(
        "Admin complaint verification error:",
        verificationError,
      );

      setError(
        verificationError instanceof Error
          ? verificationError.message
          : "Unable to verify complaint.",
      );
    } finally {
      setLoading(false);
    }
  }

  // ====================================================
  // ALREADY CLOSED
  // ====================================================

  if (currentStatus === "CLOSED") {
    return (
      <div className="admin-verification-completed">

        <p className="case-section-label">
          FINAL VERIFICATION
        </p>

        <h3>
          Complaint Closed
        </h3>

        {resolutionSummary && (
          <div className="verification-summary-item">

            <span>
              Authority Resolution
            </span>

            <strong>
              {resolutionSummary}
            </strong>

          </div>
        )}

        <div className="verification-summary-item">

          <span>
            Citizen Response
          </span>

          <strong className="citizen-response-satisfied">
            {citizenSatisfaction ===
            "SATISFIED"
              ? "Satisfied"
              : "Not Satisfied"}
          </strong>

        </div>

        {citizenFeedback && (
          <div className="verification-summary-item">

            <span>
              Citizen Feedback
            </span>

            <strong>
              {citizenFeedback}
            </strong>

          </div>
        )}

        <div className="verification-status-badge">
          CLOSED
        </div>

      </div>
    );
  }

  // ====================================================
  // ALREADY REOPENED
  // ====================================================

  if (currentStatus === "REOPENED") {
    return (
      <div className="admin-verification-completed">

        <p className="case-section-label">
          FINAL VERIFICATION
        </p>

        <h3>
          Complaint Reopened
        </h3>

        {resolutionSummary && (
          <div className="verification-summary-item">

            <span>
              Authority Resolution
            </span>

            <strong>
              {resolutionSummary}
            </strong>

          </div>
        )}

        <div className="verification-summary-item">

          <span>
            Citizen Response
          </span>

          <strong className="citizen-response-not-satisfied">
            Not Satisfied
          </strong>

        </div>

        {citizenFeedback && (
          <div className="verification-summary-item">

            <span>
              Citizen Feedback
            </span>

            <strong>
              {citizenFeedback}
            </strong>

          </div>
        )}

        <div className="verification-status-badge">
          REOPENED
        </div>

      </div>
    );
  }

  // ====================================================
  // ADMIN VERIFICATION UI
  // ====================================================

  return (
    <div className="admin-verification-action">

      {/* ==================================================
          AUTHORITY RESOLUTION
      ================================================== */}

      <div className="verification-summary">

        <p className="case-section-label">
          AUTHORITY RESOLUTION
        </p>

        <h3>
          Resolution Submitted by Authority
        </h3>

        <div className="verification-summary-item">

          <span>
            Resolution
          </span>

          <strong>
            {resolutionSummary?.trim()
              ? resolutionSummary
              : "No resolution summary provided."}
          </strong>

        </div>

      </div>

      {/* ==================================================
          CITIZEN RESPONSE
      ================================================== */}

      <div className="verification-summary">

        <p className="case-section-label">
          CITIZEN RESPONSE
        </p>

        <h3>
          Citizen Resolution Review
        </h3>

        <div className="verification-summary-item">

          <span>
            Response
          </span>

          <strong
            className={
              citizenSatisfaction ===
              "SATISFIED"
                ? "citizen-response-satisfied"
                : "citizen-response-not-satisfied"
            }
          >
            {citizenSatisfaction ===
            "SATISFIED"
              ? "Satisfied"
              : "Not Satisfied"}
          </strong>

        </div>

        <div className="verification-summary-item">

          <span>
            Citizen Feedback
          </span>

          <strong>
            {citizenFeedback?.trim()
              ? citizenFeedback
              : "No additional feedback provided."}
          </strong>

        </div>

        <div className="verification-summary-item">

          <span>
            Response Submitted
          </span>

          <strong>
            {formatDate(citizenRespondedAt)}
          </strong>

        </div>

      </div>

      {/* ==================================================
          FINAL VERIFICATION
      ================================================== */}

      <div className="verification-decision">

        <p className="case-section-label">
          VERIFICATION OPTIONS
        </p>

        <h3>
          Final Administrative Action
        </h3>

        {citizenSatisfaction ===
        "SATISFIED" ? (
          <p>
            The citizen has marked the
            resolution as{" "}
            <strong>Satisfied</strong>.
            Review the authority resolution
            and citizen feedback before closing
            the complaint.
          </p>
        ) : (
          <p>
            The citizen has marked the
            resolution as{" "}
            <strong>Not Satisfied</strong>.
            The complaint should be reopened
            for further action by the authority.
          </p>
        )}

        {/* ==================================================
            BUTTONS
        ================================================== */}

        <div className="verification-actions">

          {citizenSatisfaction ===
            "SATISFIED" && (
            <button
              type="button"
              className="verification-close-button"
              onClick={() =>
                handleVerification(
                  "CLOSE",
                )
              }
              disabled={loading}
            >
              {loading
                ? "Processing..."
                : "✓ Verify & Close"}
            </button>
          )}

          {citizenSatisfaction ===
            "NOT_SATISFIED" && (
            <button
              type="button"
              className="verification-reopen-button"
              onClick={() =>
                handleVerification(
                  "REOPEN",
                )
              }
              disabled={loading}
            >
              {loading
                ? "Processing..."
                : "↻ Reopen Complaint"}
            </button>
          )}

        </div>

        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (
          <div className="admin-verification-error">
            {error}
          </div>
        )}

        {/* ==================================================
            SUCCESS
        ================================================== */}

        {success && (
          <div className="admin-verification-success">
            {success}
          </div>
        )}

      </div>

    </div>
  );
}