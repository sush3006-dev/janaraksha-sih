"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminSettingsActions() {
  const router = useRouter();
  const supabase = createClient();

  const [showPasswordForm, setShowPasswordForm] =
    useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handlePasswordChange() {
    setMessage("");
    setError("");

    if (!password || !confirmPassword) {
      setError("Please enter and confirm your new password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } =
        await supabase.auth.updateUser({
          password,
        });

      if (updateError) {
        throw updateError;
      }

      setPassword("");
      setConfirmPassword("");
      setShowPasswordForm(false);

      setMessage("Password updated successfully.");
    } catch (passwordError) {
      console.error(
        "Password update error:",
        passwordError,
      );

      setError(
        passwordError instanceof Error
          ? passwordError.message
          : "Unable to update password.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    setError("");
    setMessage("");
    setSigningOut(true);

    try {
      const { error: signOutError } =
        await supabase.auth.signOut();

      if (signOutError) {
        throw signOutError;
      }

      router.push("/auth/login");
      router.refresh();
    } catch (signOutError) {
      console.error(
        "Sign out error:",
        signOutError,
      );

      setError(
        signOutError instanceof Error
          ? signOutError.message
          : "Unable to sign out.",
      );

      setSigningOut(false);
    }
  }

  return (
    <>
      <div className="settings-action-list">
        {/* CHANGE PASSWORD */}
        <div className="settings-action-row">
          <div>
            <strong>Change Password</strong>

            <p>
              Update the password used to access your
              JanaRaksha administrator account.
            </p>
          </div>

          <button
            type="button"
            className="settings-secondary-button"
            onClick={() => {
              setError("");
              setMessage("");
              setShowPasswordForm(!showPasswordForm);
            }}
          >
            {showPasswordForm
              ? "Cancel"
              : "Change Password"}
          </button>
        </div>

        {/* PASSWORD FORM */}
        {showPasswordForm && (
          <div className="settings-password-form">
            <div className="settings-password-field">
              <label htmlFor="admin-new-password">
                New Password
              </label>

              <input
                id="admin-new-password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Enter new password"
                disabled={loading}
              />
            </div>

            <div className="settings-password-field">
              <label htmlFor="admin-confirm-password">
                Confirm New Password
              </label>

              <input
                id="admin-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                placeholder="Confirm new password"
                disabled={loading}
              />
            </div>

            <button
              type="button"
              className="settings-primary-button"
              onClick={handlePasswordChange}
              disabled={loading}
            >
              {loading
                ? "Updating..."
                : "Update Password"}
            </button>
          </div>
        )}

        {/* SIGN OUT */}
        <div className="settings-action-row settings-signout-row">
          <div>
            <strong>Sign Out</strong>

            <p>
              Sign out of your current administrator session.
            </p>
          </div>

          <button
            type="button"
            className="settings-signout-button"
            onClick={handleSignOut}
            disabled={signingOut}
          >
            {signingOut
              ? "Signing Out..."
              : "Sign Out"}
          </button>
        </div>
      </div>

      {message && (
        <p className="settings-success-message">
          {message}
        </p>
      )}

      {error && (
        <p className="settings-error-message">
          {error}
        </p>
      )}
    </>
  );
}