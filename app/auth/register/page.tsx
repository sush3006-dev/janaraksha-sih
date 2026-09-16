
"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!fullName || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    setSuccess("Registration successful. Redirecting to Sign In...");

    setTimeout(() => {
      router.push("/auth/login");
    }, 1000);
  }

  return (
    <main className="auth-register-page">
      <Link href="/" className="auth-register-back">
        <span className="auth-register-back-arrow">←</span>
        <span>Back</span>
      </Link>

      <div
        className="auth-register-background"
        aria-hidden="true"
      />

      <section className="auth-register-card">
        <div className="auth-register-brand">
          <img
            src="/images/JanaRaksha-logo.svg"
            alt="JanaRaksha"
            className="auth-register-logo"
          />

          <div className="auth-register-brand-text">
            <h1>JANARAKSHA</h1>
            <p>JUSTICE. GUIDANCE. PROTECTION.</p>
          </div>
        </div>

        <div className="auth-register-divider">
          <span />
          <i />
          <span />
        </div>

        <div className="auth-register-heading">
          <h2>CREATE ACCOUNT</h2>
          <p>
            Register to access your
            <br />
            JanaRaksha account.
          </p>
        </div>

        <form
          className="auth-register-form"
          onSubmit={handleRegister}
          aria-busy={loading}
        >
          <div className="auth-register-field">
            <label htmlFor="fullName">Full Name</label>

            <div className="auth-register-input-wrapper">
              <svg
                className="auth-register-input-icon"
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
                id="fullName"
                type="text"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Enter your full name"
                autoComplete="name"
              />
            </div>
          </div>

          <div className="auth-register-field">
            <label htmlFor="register-email">Email</label>

            <div className="auth-register-input-wrapper">
              <svg
                className="auth-register-input-icon"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <rect
                  x="3"
                  y="5"
                  width="18"
                  height="14"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
                <path
                  d="m4 7 8 6 8-6"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              <input
                id="register-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your email"
                autoComplete="email"
              />
            </div>
          </div>

          <div className="auth-register-field">
            <label htmlFor="register-password">Password</label>

            <div className="auth-register-input-wrapper">
              <svg
                className="auth-register-input-icon"
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
                id="register-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Create a password"
                autoComplete="new-password"
              />

              <button
                type="button"
                className="auth-register-password-toggle"
                onClick={() => setShowPassword((previous) => !previous)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M3 3l18 18"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                    <path
                      d="M10.6 10.6a2 2 0 0 0 2.8 2.8"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                    <path
                      d="M9.9 5.2A10.8 10.8 0 0 1 12 5c5.2 0 9 7 9 7a17.5 17.5 0 0 1-3.1 3.8M6.2 6.2C3.9 8.2 3 12 3 12s3.8 7 9 7a10.5 10.5 0 0 0 4.1-.8"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="3"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="auth-register-field">
            <label htmlFor="confirm-password">Confirm Password</label>

            <div className="auth-register-input-wrapper">
              <svg
                className="auth-register-input-icon"
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
                <path
                  d="m9 15 2 2 4-4"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              <input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                placeholder="Confirm your password"
                autoComplete="new-password"
              />

              <button
                type="button"
                className="auth-register-password-toggle"
                onClick={() =>
                  setShowConfirmPassword((previous) => !previous)
                }
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
                aria-pressed={showConfirmPassword}
              >
                {showConfirmPassword ? (
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M3 3l18 18"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                    <path
                      d="M10.6 10.6a2 2 0 0 0 2.8 2.8"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                    <path
                      d="M9.9 5.2A10.8 10.8 0 0 1 12 5c5.2 0 9 7 9 7a17.5 17.5 0 0 1-3.1 3.8M6.2 6.2C3.9 8.2 3 12 3 12s3.8 7 9 7a10.5 10.5 0 0 0 4.1-.8"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="3"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="auth-register-error" role="alert">
              {error}
            </div>
          )}

          {success && (
            <div className="auth-register-success" role="status">
              {success}
            </div>
          )}

          <button
            type="submit"
            className="auth-register-submit"
            disabled={loading}
          >
            <span>
              {loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
            </span>

            {loading ? (
              <span
                className="auth-register-loading-spinner"
                aria-hidden="true"
              />
            ) : (
              <span className="auth-register-submit-arrow">→</span>
            )}
          </button>

          <div className="auth-register-signin">
            <p>Already have an account?</p>

            <Link
              href="/auth/login"
              className="auth-register-signin-link"
            >
              Sign In
              <span>→</span>
            </Link>
          </div>

          <div className="auth-register-security">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
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