"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";

const incidentTypes = [
  "Harassment",
  "Fraud",
  "Threat",
  "Violence",
  "Cyber Crime",
  "Other",
];

export default function RegisterComplaintPage() {
  const router = useRouter();

  const [incidentType, setIncidentType] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  function handleContinue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!incidentType) {
      setError("Please select an incident type.");
      return;
    }

    if (!description.trim()) {
      setError("Please describe the incident.");
      return;
    }

    sessionStorage.setItem(
      "janaraksha-complaint-step-1",
      JSON.stringify({
        category: incidentType,
        description: description.trim(),
      })
    );

    router.push("/user/register-complaint/details");
  }

  return (
    <main className="dashboard">
      <Sidebar activeItem="Register Complaint" />

      <section className="dashboard-content">
        <header className="dashboard-header">
          <div>
            <p className="page-label">REGISTER COMPLAINT</p>

            <h1>Incident Type</h1>

            <p className="header-description">
              Tell us what type of incident you want to report.
            </p>
          </div>
        </header>

        <form
          className="complaint-form-card"
          onSubmit={handleContinue}
        >
          <div className="form-section">
            <label htmlFor="incidentType">
              Incident Type
            </label>

            <select
              id="incidentType"
              value={incidentType}
              onChange={(event) =>
                setIncidentType(event.target.value)
              }
            >
              <option value="">
                Select incident type
              </option>

              {incidentTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="form-section">
            <label htmlFor="description">
              Incident Description
            </label>

            <textarea
              id="description"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="Describe what happened..."
              rows={7}
            />
          </div>

          {error && (
            <p className="form-error">
              {error}
            </p>
          )}

          <div className="form-actions">
            <button
              type="submit"
              className="primary-button"
            >
              Continue
              <span>→</span>
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}