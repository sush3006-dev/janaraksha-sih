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

  async function handleClose() {
    const trimmedResolution = resolution.trim();

    if (!trimmedResolution) {
      setError("Please enter the resolution summary.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const { data, error: rpcError } = await supabase.rpc(
        "close_complaint",
        {
          p_complaint_id: complaintId,
          p_resolution_summary: trimmedResolution,
        }
      );

      if (rpcError) {
        throw new Error(rpcError.message);
      }

      if (!data?.success) {
        throw new Error("Unable to close the complaint.");
      }

      setOpen(false);
      setResolution("");

      router.refresh();
    } catch (closeError) {
      console.error("Close complaint error:", closeError);

      setError(
        closeError instanceof Error
          ? closeError.message
          : "Unable to close the complaint."
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
        onClick={() => {
          setError("");
          setOpen(true);
        }}
      >
        Mark as Resolved
      </button>

      {open && (
        <div className="close-complaint-overlay">
          <div className="close-complaint-modal">
            <div className="close-complaint-modal-header">
              <div>
                <p className="close-complaint-eyebrow">
                  RESOLVE COMPLAINT
                </p>

                <h2>Mark Complaint as Resolved</h2>
              </div>

              <button
                type="button"
                className="close-complaint-close"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                ×
              </button>
            </div>

            <p className="close-complaint-description">
              Record the action taken or resolution before
              closing this complaint.
            </p>

            <label
              htmlFor="resolution-summary"
              className="close-complaint-label"
            >
              Resolution Summary
            </label>

            <textarea
              id="resolution-summary"
              value={resolution}
              onChange={(event) =>
                setResolution(event.target.value)
              }
              placeholder="Describe the action taken and how the complaint was resolved..."
              rows={6}
              disabled={loading}
              autoFocus
            />

            {error && (
              <p className="close-complaint-error">
                {error}
              </p>
            )}

            <div className="close-complaint-actions">
              <button
                type="button"
                className="close-complaint-cancel"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </button>

              <button
                type="button"
                className="close-complaint-confirm"
                onClick={handleClose}
                disabled={loading || !resolution.trim()}
              >
                {loading ? "Closing..." : "Mark as Resolved"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}