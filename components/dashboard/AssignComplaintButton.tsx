"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

type AssignComplaintButtonProps = {
  complaintId: string;
};

type Authority = {
  id: string;
  full_name: string | null;
  email: string | null;
};

export default function AssignComplaintButton({
  complaintId,
}: AssignComplaintButtonProps) {
  const router = useRouter();

  const [authorities, setAuthorities] = useState<Authority[]>([]);
  const [selectedAuthorityId, setSelectedAuthorityId] = useState("");
  const [loadingAuthorities, setLoadingAuthorities] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function fetchAuthorities() {
      setLoadingAuthorities(true);
      setError("");

      const { data, error: fetchError } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .eq("role", "AUTHORITY")
        .order("full_name", { ascending: true });

      if (!isMounted) return;

      if (fetchError) {
        console.error("Authority fetch error:", fetchError);
        setError(fetchError.message || "Unable to load authorities.");
        setLoadingAuthorities(false);
        return;
      }

      setAuthorities(data ?? []);
      setLoadingAuthorities(false);
    }

    fetchAuthorities();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleAssignComplaint() {
    if (!selectedAuthorityId) {
      setError("Please select an authority first.");
      return;
    }

    if (!complaintId) {
      setError("Complaint ID is missing.");
      return;
    }

    setAssigning(true);
    setError("");
    setSuccess("");

    const { data, error: rpcError } = await supabase.rpc(
      "admin_assign_complaint",
      {
        p_complaint_id: complaintId,
        p_authority_id: selectedAuthorityId,
      }
    );

    if (rpcError) {
      console.error("Assignment RPC error:", rpcError);
      setError(rpcError.message || "Unable to assign complaint.");
      setAssigning(false);
      return;
    }

    if (!data || data.success !== true) {
      setError("Complaint assignment was not successful.");
      setAssigning(false);
      return;
    }

    setSuccess("Complaint assigned successfully.");
    setSelectedAuthorityId("");
    setAssigning(false);

    router.refresh();
  }

  return (
    <div className="complaint-assignment-box">
      <h3 className="complaint-assignment-title">
        Assign Complaint to Authority
      </h3>

      <div className="complaint-assignment-field">
        <label htmlFor="authority-select">
          Select Authority
        </label>

        <select
          id="authority-select"
          value={selectedAuthorityId}
          onChange={(event) => {
            setSelectedAuthorityId(event.target.value);
            setError("");
            setSuccess("");
          }}
          disabled={loadingAuthorities || assigning}
          className="form-input"
        >
          <option value="">
            {loadingAuthorities
              ? "Loading authorities..."
              : authorities.length === 0
                ? "No authorities found"
                : "Select Authority"}
          </option>

          {authorities.map((authority) => (
            <option key={authority.id} value={authority.id}>
              {authority.full_name || authority.email || "Unnamed Authority"}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        onClick={handleAssignComplaint}
        disabled={
          loadingAuthorities ||
          assigning ||
          authorities.length === 0 ||
          !selectedAuthorityId
        }
        className="primary-button"
      >
        {assigning ? "Assigning..." : "Assign Complaint"}
      </button>

      {error && (
        <p
          role="alert"
          className="evidence-viewer-error"
        >
          {error}
        </p>
      )}

      {success && (
        <p
          role="status"
          style={{
            color: "green",
            marginTop: "10px",
          }}
        >
          {success}
        </p>
      )}
    </div>
  );
}