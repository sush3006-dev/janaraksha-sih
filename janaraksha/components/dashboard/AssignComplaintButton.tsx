"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type AssignComplaintButtonProps = {
  complaintId: string;
};

export default function AssignComplaintButton({
  complaintId,
}: AssignComplaintButtonProps) {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAssign() {
    setLoading(true);
    setError("");

    try {
      const { data, error: assignError } =
        await supabase.rpc("assign_complaint", {
          p_complaint_id: complaintId,
        });

      if (assignError) {
        console.error(
          "Complaint assignment error:",
          assignError
        );

        console.error(
          "Assignment error details:",
          JSON.stringify(assignError, null, 2)
        );

        setError(
          assignError.message ||
            "Unable to assign complaint."
        );

        return;
      }

      console.log(
        "Complaint assigned successfully:",
        data
      );

      router.refresh();
    } catch (error) {
      console.error(
        "Unexpected assignment error:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong while assigning the complaint."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        className="primary-button"
        onClick={handleAssign}
        disabled={loading}
      >
        {loading
          ? "Assigning..."
          : "Assign Complaint"}
      </button>

      {error && (
        <p className="evidence-viewer-error">
          {error}
        </p>
      )}
    </div>
  );
}