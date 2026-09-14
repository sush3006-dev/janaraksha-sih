"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type AuthorityProfileActionsProps = {
  currentName: string;
};

export default function AuthorityProfileActions({
  currentName,
}: AuthorityProfileActionsProps) {
  const router = useRouter();
  const supabase = createClient();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(currentName || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSave() {
    const trimmedName = name.trim();

    setMessage("");
    setError("");

    if (!trimmedName) {
      setError("Full name cannot be empty.");
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw new Error(userError.message);
      }

      if (!user) {
        throw new Error("You must be logged in.");
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          full_name: trimmedName,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateError) {
        throw new Error(updateError.message);
      }

      setName(trimmedName);
      setEditing(false);
      setMessage("Profile updated successfully.");

      router.refresh();
    } catch (profileError) {
      console.error(
        "Profile update error:",
        profileError
      );

      setError(
        profileError instanceof Error
          ? profileError.message
          : "Unable to update profile."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    setName(currentName || "");
    setError("");
    setMessage("");
    setEditing(false);
  }

  if (!editing) {
    return (
      <div className="profile-actions">
        <button
          type="button"
          className="profile-edit-button"
          onClick={() => {
            setMessage("");
            setError("");
            setName(currentName || "");
            setEditing(true);
          }}
        >
          ✎ Edit Profile
        </button>

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
      </div>
    );
  }

  return (
    <div className="profile-edit-form">
      <label htmlFor="authority-full-name">
        Full Name
      </label>

      <input
        id="authority-full-name"
        type="text"
        value={name ?? ""}
        onChange={(event) =>
          setName(event.target.value)
        }
        disabled={loading}
        autoFocus
      />

      <div className="profile-edit-actions">
        <button
          type="button"
          className="profile-cancel-button"
          onClick={handleCancel}
          disabled={loading}
        >
          Cancel
        </button>

        <button
          type="button"
          className="profile-save-button"
          onClick={handleSave}
          disabled={loading || !name.trim()}
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {error && (
        <p className="profile-error-message">
          {error}
        </p>
      )}
    </div>
  );
}