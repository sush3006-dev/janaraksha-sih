"use client";

import {
  ChangeEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import {
  deleteEvidenceFile,
  getEvidenceFile,
  saveEvidenceFile,
} from "@/lib/complaint-evidence";

type Evidence = {
  id: string;
  file: File;
  file_name: string;
  file_size: number;
  file_type: string;
  evidence_type: string;
};

function detectEvidenceType(file: File): string {
  const type = file.type.toLowerCase();

  if (type.startsWith("image/")) {
    return "Photo";
  }

  if (type.startsWith("video/")) {
    return "Video";
  }

  if (type.startsWith("audio/")) {
    return "Audio";
  }

  if (
    type === "application/pdf" ||
    type.includes("document") ||
    type.includes("word")
  ) {
    return "Document";
  }

  return "Other";
}

function createEvidence(file: File): Evidence {
  return {
    id: `${file.name}-${file.size}-${file.lastModified}`,
    file,
    file_name: file.name,
    file_size: file.size,
    file_type: file.type,
    evidence_type: detectEvidenceType(file),
  };
}

export default function EvidencePage() {
  const router = useRouter();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [hasEvidence, setHasEvidence] =
    useState<boolean | null>(null);

  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function restoreDraft() {
      const draft = sessionStorage.getItem(
        "janaraksha-complaint-draft"
      );

      if (!draft) {
        router.replace("/user/register-complaint");
        return;
      }

      try {
        const parsedDraft = JSON.parse(draft);

        if (!Array.isArray(parsedDraft.evidence)) {
          setLoading(false);
          return;
        }

        if (parsedDraft.evidence.length === 0) {
          setHasEvidence(false);
          setLoading(false);
          return;
        }

        const restoredEvidence: Evidence[] = [];

        for (const item of parsedDraft.evidence) {
          if (
            !item.id ||
            !item.file_name ||
            item.file_size === undefined ||
            item.file_type === undefined ||
            !item.evidence_type
          ) {
            continue;
          }

          const file = await getEvidenceFile(item.id);

          if (!file) {
            console.warn(
              `Evidence file not found in IndexedDB: ${item.file_name}`
            );
            continue;
          }

          restoredEvidence.push({
            id: item.id,
            file,
            file_name: item.file_name,
            file_size: Number(item.file_size) || 0,
            file_type: item.file_type || "",
            evidence_type:
              item.evidence_type || "Other",
          });
        }

        setEvidence(restoredEvidence);
        setHasEvidence(true);
      } catch (restoreError) {
        console.error(
          "Unable to restore complaint evidence:",
          restoreError
        );

        setError(
          "Unable to restore your evidence. Please try again."
        );
      } finally {
        setLoading(false);
      }
    }

    restoreDraft();
  }, [router]);

  async function handleFileChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    setError("");

    const files = Array.from(
      event.target.files ?? []
    );

    if (files.length === 0) {
      return;
    }

    setLoading(true);

    try {
      const existingIds = new Set(
        evidence.map((item) => item.id)
      );

      const newEvidence: Evidence[] = [];

      for (const file of files) {
        const item = createEvidence(file);

        /*
         * Prevent the same exact file from being
         * added more than once.
         */
        if (existingIds.has(item.id)) {
          continue;
        }

        await saveEvidenceFile(item.id, file);

        newEvidence.push(item);
        existingIds.add(item.id);
      }

      setEvidence((currentEvidence) => [
        ...currentEvidence,
        ...newEvidence,
      ]);

      /*
       * Once at least one file is added,
       * evidence is automatically set to Yes.
       */
      if (newEvidence.length > 0) {
        setHasEvidence(true);
      }
    } catch (storageError) {
      console.error(
        "Evidence storage error:",
        storageError
      );

      setError(
        "Unable to save the selected evidence. Please try again."
      );
    } finally {
      setLoading(false);

      /*
       * Reset the input so the user can open
       * the file picker again and select more files.
       */
      event.target.value = "";
    }
  }

  async function handleRemoveEvidence(id: string) {
    setError("");

    try {
      await deleteEvidenceFile(id);

      setEvidence((currentEvidence) =>
        currentEvidence.filter(
          (item) => item.id !== id
        )
      );
    } catch (removeError) {
      console.error(
        "Evidence removal error:",
        removeError
      );

      setError(
        "Unable to remove this evidence. Please try again."
      );
    }
  }

  async function handleNoEvidence() {
    setHasEvidence(false);
    setError("");

    try {
      /*
       * Delete all actual files from IndexedDB.
       */
      await Promise.all(
        evidence.map((item) =>
          deleteEvidenceFile(item.id)
        )
      );

      setEvidence([]);

      /*
       * Also update the complaint draft immediately.
       */
      const draft = sessionStorage.getItem(
        "janaraksha-complaint-draft"
      );

      if (draft) {
        const parsedDraft = JSON.parse(draft);

        sessionStorage.setItem(
          "janaraksha-complaint-draft",
          JSON.stringify({
            ...parsedDraft,
            evidence: [],
          })
        );
      }
    } catch (clearError) {
      console.error(
        "Unable to clear evidence:",
        clearError
      );

      setError(
        "Unable to clear the selected evidence."
      );
    }
  }

  function handleSelectMore() {
    fileInputRef.current?.click();
  }

  function handleContinue() {
    setError("");

    const draft = sessionStorage.getItem(
      "janaraksha-complaint-draft"
    );

    if (!draft) {
      router.replace("/user/register-complaint");
      return;
    }

    try {
      const parsedDraft = JSON.parse(draft);

      /*
       * Only metadata is stored in sessionStorage.
       *
       * Actual files remain in IndexedDB.
       */
      const evidenceMetadata = evidence.map(
        ({
          file,
          ...metadata
        }) => metadata
      );

      sessionStorage.setItem(
        "janaraksha-complaint-draft",
        JSON.stringify({
          ...parsedDraft,
          evidence: evidenceMetadata,
        })
      );

      router.push(
        "/user/register-complaint/review"
      );
    } catch (saveError) {
      console.error(
        "Evidence draft error:",
        saveError
      );

      setError(
        "Unable to save complaint information."
      );
    }
  }

  function handleBack() {
    router.push(
      "/user/register-complaint/people"
    );
  }

  if (loading) {
    return (
      <main className="dashboard">
        <Sidebar activeItem="Register Complaint" />

        <section className="dashboard-content">
          <header className="dashboard-header">
            <div>
              <p className="page-label">
                REGISTER COMPLAINT
              </p>

              <h1>Evidence & Documents</h1>

              <p className="header-description">
                Loading your saved evidence...
              </p>
            </div>
          </header>
        </section>
      </main>
    );
  }

  return (
    <main className="dashboard">
      <Sidebar activeItem="Register Complaint" />

      <section className="dashboard-content">
        <header className="dashboard-header">
          <div>
            <p className="page-label">
              REGISTER COMPLAINT
            </p>

            <h1>Evidence & Documents</h1>

            <p className="header-description">
              Add photos, videos, documents, or other
              evidence related to the incident, if
              available.
            </p>
          </div>
        </header>

        <section className="complaint-form-card">
          <div className="form-section">
            <label>
              Do you have any evidence or documents?
            </label>

            <label className="checkbox-label">
              <input
                type="radio"
                name="hasEvidence"
                checked={hasEvidence === true}
                onChange={() => {
                  setHasEvidence(true);
                  setError("");
                }}
              />

              Yes
            </label>

            <label className="checkbox-label">
              <input
                type="radio"
                name="hasEvidence"
                checked={hasEvidence === false}
                onChange={handleNoEvidence}
              />

              No
            </label>
          </div>

          {hasEvidence === true && (
            <>
              <input
                ref={fileInputRef}
                id="evidenceFile"
                type="file"
                multiple
                onChange={handleFileChange}
                style={{ display: "none" }}
              />

              <div className="form-section">
                <label>
                  Evidence Files
                </label>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={handleSelectMore}
                  disabled={loading}
                >
                  + Select Evidence Files
                </button>

                <p className="location-message">
                  You can select files from different
                  folders. Previously selected files will
                  remain.
                </p>
              </div>

              {evidence.length > 0 && (
                <div className="evidence-list">
                  <h2>
                    Selected Evidence (
                    {evidence.length})
                  </h2>

                  {evidence.map((item) => (
                    <div
                      key={item.id}
                      className="evidence-item"
                    >
                      <div>
                        <strong>
                          {item.file_name}
                        </strong>

                        <p>
                          {item.evidence_type} ·{" "}
                          {Math.ceil(
                            item.file_size / 1024
                          )}{" "}
                          KB
                        </p>
                      </div>

                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() =>
                          handleRemoveEvidence(
                            item.id
                          )
                        }
                      >
                        Remove
                      </button>
                    </div>
                  ))}

                  <div className="form-actions">
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={handleSelectMore}
                      disabled={loading}
                    >
                      + Select More Files
                    </button>
                  </div>
                </div>
              )}

              {error && (
                <p className="form-error">
                  {error}
                </p>
              )}
            </>
          )}

          {error && hasEvidence !== true && (
            <p className="form-error">
              {error}
            </p>
          )}

          <div className="form-actions form-actions-between">
            <button
              type="button"
              className="secondary-button"
              onClick={handleBack}
            >
              ← Back
            </button>

            <button
              type="button"
              className="primary-button"
              onClick={handleContinue}
              disabled={
                hasEvidence === null || loading
              }
            >
              Continue
              <span>→</span>
            </button>
          </div>
        </section>
      </section>
    </main>
  );
}