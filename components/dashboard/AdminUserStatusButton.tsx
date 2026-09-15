"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type AdminUserStatusButtonProps = {
  userId: string;
  currentStatus: string;
};

export default function AdminUserStatusButton({
  userId,
  currentStatus,
}: AdminUserStatusButtonProps) {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const isActive =
    currentStatus === "ACTIVE";

  async function handleStatusChange() {
    const newStatus = isActive
      ? "INACTIVE"
      : "ACTIVE";

    const confirmed = window.confirm(
      isActive
        ? "Are you sure you want to deactivate this user?"
        : "Are you sure you want to activate this user?"
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);
    setError("");

    const { error: rpcError } =
      await supabase.rpc(
        "admin_update_user_status",
        {
          p_user_id: userId,
          p_status: newStatus,
        }
      );

    if (rpcError) {
      console.error(
        "User status update error:",
        rpcError
      );

      setError(rpcError.message);
      setLoading(false);
      return;
    }

    router.refresh();
  }

  return (
    <div className="admin-user-status-action">
      <button
        type="button"
        className={
          isActive
            ? "admin-deactivate-button"
            : "admin-activate-button"
        }
        onClick={handleStatusChange}
        disabled={loading}
      >
        {loading
          ? "Updating..."
          : isActive
            ? "Deactivate Account"
            : "Activate Account"}
      </button>

      {error && (
        <p className="admin-error-message">
          {error}
        </p>
      )}
    </div>
  );
}