"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type AdminProfileActionsProps = {
  userId: string;
  currentName: string;
};

export default function AdminProfileActions({
  userId,
  currentName,
}: AdminProfileActionsProps) {
  const supabase = createClient();
  const router = useRouter();

  const [name, setName] = useState(currentName);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleUpdateProfile() {
    setMessage("");
    setError("");

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Full name cannot be empty.");
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          full_name: trimmedName,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (updateError) {
        throw updateError;
      }

      setMessage("Profile updated successfully.");
      router.refresh();
    } catch (updateError) {
      console.error("Profile update error:", updateError);

      setError(
        updateError instanceof Error
          ? updateError.message
          : "Unable to update profile.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const { error: signOutError } =
        await supabase.auth.signOut();

      if (signOutError) {
        throw signOutError;
      }

      router.push("/auth/login");
      router.refresh();
    } catch (signOutError) {
      console.error("Sign out error:", signOutError);

      setError(
        signOutError instanceof Error
          ? signOutError.message
          : "Unable to sign out.",
      );

      setLoading(false);
    }
  }

  return (
    <>
      <div className="profile-actions">
        <div className="profile-form-group">
          <label htmlFor="admin-full-name">
            Full Name
          </label>

          <input
            id="admin-full-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Enter your full name"
            className="profile-input"
            disabled={loading}
          />
        </div>

        <div className="profile-action-buttons">
          <button
            type="button"
            onClick={handleUpdateProfile}
            disabled={loading}
            className="profile-primary-button"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>

          <button
            type="button"
            onClick={handleSignOut}
            disabled={loading}
            className="profile-danger-button"
          >
            Sign Out
          </button>
        </div>
      </div>

      {message && (
        <p className="profile-success-message">
          {message}
        </p>
      )}

      {error && (
        <p className="profile-error-message">
          {error}
        </p>
      )}
    </>
  );
}