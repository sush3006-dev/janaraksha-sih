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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleRegister(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (
      !fullName ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    setLoading(true);

    const {
      error: signUpError,
    } = await supabase.auth.signUp({
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

    setSuccess(
      "Registration successful. Redirecting to Sign In..."
    );

    setTimeout(() => {
      router.push("/auth/login");
    }, 1000);
  }

  return (
    <main className="auth-register-page">

      {/* =====================================================
          BACK
      ===================================================== */}

      <Link
        href="/"
        className="auth-register-back"
      >
        <span className="auth-register-back-arrow">
          ←
        </span>

        <span>Back</span>
      </Link>


      {/* =====================================================
          BACKGROUND ARTWORK
      ===================================================== */}

      <div
        className="auth-register-background"
        aria-hidden="true"
      />


      {/* =====================================================
          REGISTER CARD
      ===================================================== */}

      <section className="auth-register-card">

        {/* ===================================================
            BRAND
        =================================================== */}

        <div className="auth-register-brand">

          <img
            src="/images/JanaRaksha-logo.svg"
            alt="JanaRaksha"
            className="auth-register-logo"
          />

          <div className="auth-register-brand-text">

            <h1>
              JANARAKSHA
            </h1>

            <p>
              JUSTICE. GUIDANCE. PROTECTION.
            </p>

          </div>

        </div>


        {/* ===================================================
            DECORATIVE DIVIDER
        =================================================== */}

        <div className="auth-register-divider">

          <span />

          <i />

          <span />

        </div>


        {/* ===================================================
            HEADING
        =================================================== */}

        <div className="auth-register-heading">

          <h2>
            CREATE ACCOUNT
          </h2>

          <p>
            Register to access your
            JanaRaksha account.
          </p>

        </div>


        {/* ===================================================
            FORM
        =================================================== */}

        <form
          className="auth-register-form"
          onSubmit={handleRegister}
        >

          {/* =================================================
              NAME
          ================================================= */}

          <div className="auth-register-field">

            <label htmlFor="fullName">
              Full Name
            </label>

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
                onChange={(event) =>
                  setFullName(event.target.value)
                }
                placeholder="Enter your full name"
                autoComplete="name"
              />

            </div>

          </div>


          {/* =================================================
              EMAIL
          ================================================= */}

          <div className="auth-register-field">

            <label htmlFor="register-email">
              Email
            </label>

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
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="Enter your email"
                autoComplete="email"
              />

            </div>

          </div>


          {/* =================================================
              PASSWORD
          ================================================= */}

          <div className="auth-register-field">

            <label htmlFor="register-password">
              Password
            </label>

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
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Create a password"
                autoComplete="new-password"
              />

            </div>

          </div>


          {/* =================================================
              CONFIRM PASSWORD
          ================================================= */}

          <div className="auth-register-field">

            <label htmlFor="confirm-password">
              Confirm Password
            </label>

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
                type="password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(
                    event.target.value
                  )
                }
                placeholder="Confirm your password"
                autoComplete="new-password"
              />

            </div>

          </div>


          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="auth-register-error">
              {error}
            </div>
          )}


          {/* =================================================
              SUCCESS
          ================================================= */}

          {success && (
            <div className="auth-register-success">
              {success}
            </div>
          )}


          {/* =================================================
              REGISTER BUTTON
          ================================================= */}

          <button
            type="submit"
            className="auth-register-submit"
            disabled={loading}
          >

            <span>
              {loading
                ? "CREATING ACCOUNT..."
                : "CREATE ACCOUNT"}
            </span>

            {!loading && (
              <span className="auth-register-submit-arrow">
                →
              </span>
            )}

          </button>


          {/* =================================================
              SIGN IN
          ================================================= */}

          <div className="auth-register-signin">

            <p>
              Already have an account?
            </p>

            <Link
              href="/auth/login"
              className="auth-register-signin-link"
            >
              Sign In
              <span>
                →
              </span>
            </Link>

          </div>


          {/* =================================================
              SECURITY
          ================================================= */}

          <div className="auth-register-security">

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

            <span>
              Your data is secure with us
            </span>

          </div>

        </form>

      </section>

    </main>
  );
}