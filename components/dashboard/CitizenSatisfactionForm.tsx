"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type CitizenSatisfactionFormProps = {
  complaintId: string;
};

export default function CitizenSatisfactionForm({
  complaintId,
}: CitizenSatisfactionFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [satisfaction, setSatisfaction] = useState<
    "SATISFIED" | "NOT_SATISFIED" | ""
  >("");

  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit() {
    if (!satisfaction) {
      setError("Please select Satisfied or Not Satisfied.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("You must be logged in.");
      }

      /*
       * First verify that this complaint belongs
       * to the currently logged-in citizen.
       */
      const { data: complaint, error: complaintError } =
        await supabase
          .from("complaints")
          .select("id, user_id, status")
          .eq("id", complaintId)
          .eq("user_id", user.id)
          .maybeSingle();

      if (complaintError) {
        console.error(
          "Complaint lookup error:",
          complaintError
        );

        throw new Error(complaintError.message);
      }

      if (!complaint) {
        throw new Error(
          "Complaint not found or you do not have access to it."
        );
      }

      if (complaint.status !== "DONE") {
        throw new Error(
          `This complaint cannot receive a response because its current status is ${complaint.status}.`
        );
      }

      /*
       * Citizen response:
       *
       * DONE
       *   ↓
       * UNDER_VERIFICATION
       */
      const { error: updateError } = await supabase
        .from("complaints")
        .update({
          citizen_satisfaction: satisfaction,
          citizen_feedback: feedback.trim() || null,
          citizen_responded_at: new Date().toISOString(),
          status: "UNDER_VERIFICATION",
          updated_at: new Date().toISOString(),
        })
        .eq("id", complaintId)
        .eq("user_id", user.id)
        .eq("status", "DONE");

      if (updateError) {
        console.error(
          "Citizen response update error:",
          updateError
        );

        throw new Error(
          updateError.message ||
            "Unable to submit citizen response."
        );
      }

      setSuccess(
        "Your response has been submitted successfully. The administrator will now verify your response."
      );

      setSatisfaction("");
      setFeedback("");

      /*
       * Refresh the server component so the updated
       * complaint status and response are displayed.
       */
      router.refresh();
    } catch (submitError) {
      console.error(
        "Citizen satisfaction submit error:",
        submitError
      );

      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to submit your response."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="citizen-satisfaction-card">
      <p className="citizen-satisfaction-eyebrow">
        RESOLUTION REVIEW
      </p>

      <h2>Are you satisfied with the resolution?</h2>

      <p>
        Review the action taken by the authority and submit
        your response. The administrator will verify your
        feedback.
      </p>

      <div className="citizen-satisfaction-options">
        <button
          type="button"
          className={
            satisfaction === "SATISFIED"
              ? "satisfaction-option selected"
              : "satisfaction-option"
          }
          onClick={() => setSatisfaction("SATISFIED")}
          disabled={loading}
        >
          Satisfied
        </button>

        <button
          type="button"
          className={
            satisfaction === "NOT_SATISFIED"
              ? "satisfaction-option selected"
              : "satisfaction-option"
          }
          onClick={() => setSatisfaction("NOT_SATISFIED")}
          disabled={loading}
        >
          Not Satisfied
        </button>
      </div>

      <label htmlFor="citizen-feedback">
        Additional Feedback
      </label>

      <textarea
        id="citizen-feedback"
        value={feedback}
        onChange={(event) =>
          setFeedback(event.target.value)
        }
        placeholder="Explain your experience or provide additional feedback..."
        rows={5}
        disabled={loading}
      />

      {error && (
        <p className="citizen-satisfaction-error">
          {error}
        </p>
      )}

      {success && (
        <p className="citizen-satisfaction-success">
          {success}
        </p>
      )}

      <button
        type="button"
        className="primary-button"
        onClick={handleSubmit}
        disabled={loading || !satisfaction}
      >
        {loading ? "Submitting..." : "Submit Response"}
      </button>
    </section>
  );
}