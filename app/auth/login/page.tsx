"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    const {
      data,
      error: loginError,
    } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      setLoading(false);
      setError(loginError.message);
      return;
    }

    if (!data.user) {
      setLoading(false);
      setError("Login failed. User information not found.");
      return;
    }

    const {
      data: profile,
      error: profileError,
    } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (profileError) {
      setLoading(false);

      setError(
        `Profile error: ${profileError.message} (code: ${profileError.code})`
      );

      console.error("Profile error:", profileError);
      return;
    }

    setLoading(false);

    if (profile.role === "USER") {
      router.push("/user");
      return;
    }

    if (profile.role === "AUTHORITY") {
      router.push("/authority");
      return;
    }

    if (profile.role === "SUPER_ADMIN") {
      router.push("/admin");
      return;
    }

    setError("Invalid user role.");
  }

  return (
    <main className="auth-login-page">
      {/* Back */}
      <Link href="/" className="auth-back">
        <span className="auth-back-arrow">←</span>
        <span>Back</span>
      </Link>

      {/* Background Artwork */}
      <div
        className="auth-login-background"
        aria-hidden="true"
      />

      {/* Login Card */}
      <section className="auth-login-card">
        {/* Brand */}
        <div className="auth-login-brand">
          <img
            src="/images/JanaRaksha-logo.svg"
            alt="JanaRaksha"
            className="auth-login-logo"
          />

          <div className="auth-login-brand-text">
            <h1>JANARAKSHA</h1>
            <p>JUSTICE. GUIDANCE. PROTECTION.</p>
          </div>
        </div>

        {/* Decorative Divider */}
        <div className="auth-login-divider">
          <span />
          <i />
          <span />
        </div>

        {/* Heading */}
        <div className="auth-login-heading">
          <h2>WELCOME BACK</h2>

          <p>
            Sign in to continue to your
            <br />
            JanaRaksha account.
          </p>
        </div>

        {/* Login Form */}
        <form
          className="auth-login-form"
          onSubmit={handleLogin}
        >
          {/* Email */}
          <div className="auth-field">
            <label htmlFor="email">Email</label>

            <div className="auth-input-wrapper">
              <svg
                className="auth-input-icon"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  cx="12"
                  cy="8"
                  r="4"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />

                <path
                  d="M4.5 21a7.5 7.5 0 0 1 15 0"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="Enter your email"
                autoComplete="email"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="auth-field">
            <label htmlFor="password">Password</label>

            <div className="auth-input-wrapper">
              <svg
                className="auth-input-icon"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <rect
                  x="5"
                  y="10"
                  width="14"
                  height="10"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />

                <path
                  d="M8 10V7a4 4 0 0 1 8 0v3"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />

                <circle
                  cx="12"
                  cy="15"
                  r="1"
                  fill="currentColor"
                />
              </svg>

              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />

              {/* Show / Hide Password */}
              <button
                type="button"
                className="auth-password-eye"
                onClick={() =>
                  setShowPassword((previous) => !previous)
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
                aria-pressed={showPassword}
              >
                {showPassword ? (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />

                    <circle
                      cx="12"
                      cy="12"
                      r="2.5"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />

                    <circle
                      cx="12"
                      cy="12"
                      r="2.5"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />

                    <path
                      d="M4 4l16 16"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </button>
            </div>

            <div className="auth-forgot-row">
              <button
                type="button"
                className="auth-forgot"
                onClick={() =>
                  setError(
                    "Password reset is not available yet."
                  )
                }
              >
                Forgot Password?
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div
              className="auth-login-error"
              role="alert"
            >
              {error}
            </div>
          )}

          {/* Loading Message */}
          {loading && (
            <div
              className="auth-login-loading"
              role="status"
              aria-live="polite"
            >
              <span className="auth-small-spinner" />
              <span>
                Checking your credentials. Please wait...
              </span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="auth-login-submit"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? (
              <>
                <span className="auth-loading-spinner" />
                <span>VERIFYING...</span>
              </>
            ) : (
              <>
                <span>SIGN IN</span>
                <span className="auth-submit-arrow">
                  →
                </span>
              </>
            )}
          </button>

          {/* OR */}
          <div className="auth-or">
            <span />
            <strong>OR</strong>
            <span />
          </div>

          {/* Register */}
          <div className="auth-register-prompt">
            <p>Don’t have an account?</p>

            <Link
              href="/auth/register"
              className="auth-register-link"
            >
              Register Now
              <span>→</span>
            </Link>
          </div>

          {/* Security */}
          <div className="auth-security">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M12 3 19 6v5.5c0 4.3-2.7 7.9-7 9.5-4.3-1.6-7-5.2-7-9.5V6l7-3Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />

              <path
                d="m9 12 2 2 4-4"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <span>Your data is secure with us</span>
          </div>
        </form>
      </section>
    </main>
  );
}