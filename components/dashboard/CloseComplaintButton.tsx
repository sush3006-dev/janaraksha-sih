"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type CloseComplaintButtonProps = {
  complaintId: string;
};

export default function CloseComplaintButton({
  complaintId,
}: CloseComplaintButtonProps) {
  const router = useRouter();
  const supabase = createClient();

  const [open, setOpen] = useState(false);
  const [resolution, setResolution] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function openModal() {
    setError("");
    setOpen(true);
  }

  function closeModal() {
    if (loading) return;

    setOpen(false);
    setResolution("");
    setError("");
  }

  async function handleMarkAsDone() {
    const trimmedResolution = resolution.trim();

    if (!trimmedResolution) {
      setError("Please enter the resolution summary.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("You must be logged in.");
      }

      // Step 1: Verify that this complaint is assigned to this Authority
      const { data: complaint, error: complaintError } = await supabase
        .from("complaints")
        .select("id, status, assigned_authority_id")
        .eq("id", complaintId)
        .maybeSingle();

      if (complaintError) {
        throw new Error(complaintError.message);
      }

      if (!complaint) {
        throw new Error("Complaint was not found.");
      }

      if (complaint.assigned_authority_id !== user.id) {
        throw new Error(
          "This complaint is not assigned to your Authority account.",
        );
      }

      if (
        complaint.status !== "ASSIGNED" &&
        complaint.status !== "IN_PROGRESS" &&
        complaint.status !== "REOPENED"
      ) {
        throw new Error(
          `This complaint cannot be marked as done from status ${complaint.status}.`,
        );
      }

      // Step 2: Update the complaint
      const { data: updatedComplaint, error: updateError } = await supabase
        .from("complaints")
        .update({
          status: "DONE",
          resolution_summary: trimmedResolution,
          updated_at: new Date().toISOString(),
        })
        .eq("id", complaintId)
        .eq("assigned_authority_id", user.id)
        .select("id, status, resolution_summary")
        .single();

      if (updateError) {
        console.error("Supabase update error:", updateError);
        throw new Error(updateError.message);
      }

      if (!updatedComplaint) {
        throw new Error(
          "The complaint was not updated. Check the Supabase RLS policy.",
        );
      }

      console.log("Complaint successfully updated:", updatedComplaint);

      setOpen(false);
      setResolution("");
      router.refresh();
    } catch (submitError) {
      console.error("Mark complaint as done error:", submitError);

      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to mark complaint as done.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        className="close-complaint-button"
        onClick={openModal}
      >
        Mark as Done
      </button>

      {open && (
        <div className="close-complaint-overlay">
          <div className="close-complaint-modal">
            <div className="close-complaint-modal-header">
              <div>
                <p className="close-complaint-eyebrow">
                  COMPLETE COMPLAINT ACTION
                </p>

                <h2>Mark Complaint as Done</h2>
              </div>

              <button
                type="button"
                className="close-complaint-close"
                onClick={closeModal}
                disabled={loading}
              >
                ×
              </button>
            </div>

            <p className="close-complaint-description">
              Describe the action taken by your authority. The administrator
              will verify the resolution with the citizen before closing the
              complaint.
            </p>

            <label
              htmlFor="resolution-summary"
              className="close-complaint-label"
            >
              Action Taken / Resolution Summary
            </label>

            <textarea
              id="resolution-summary"
              value={resolution}
              onChange={(event) => setResolution(event.target.value)}
              placeholder="Describe the action taken and the current resolution..."
              rows={6}
              disabled={loading}
              autoFocus
            />

            {error && <p className="close-complaint-error">{error}</p>}

            <div className="close-complaint-actions">
              <button
                type="button"
                className="close-complaint-cancel"
                onClick={closeModal}
                disabled={loading}
              >
                Cancel
              </button>

              <button
                type="button"
                className="close-complaint-confirm"
                onClick={handleMarkAsDone}
                disabled={loading || !resolution.trim()}
              >
                {loading ? "Saving..." : "Mark as Done"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}