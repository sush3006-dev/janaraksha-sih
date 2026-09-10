"use client";

import { useState } from "react";

type EvidenceViewerProps = {
  evidenceId: string;
  fileName: string;
  fileType?: string | null;
};

export default function EvidenceViewer({
  evidenceId,
  fileName,
  fileType,
}: EvidenceViewerProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [url, setUrl] = useState("");

  async function handleView() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/authority/evidence/${evidenceId}/view`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || "Unable to open evidence.");
        return;
      }

      setUrl(data.url);
    } catch {
      setError("Unable to open evidence.");
    } finally {
      setLoading(false);
    }
  }

  const normalizedType = fileType?.toLowerCase() || "";

  const isImage = normalizedType.startsWith("image/");
  const isVideo = normalizedType.startsWith("video/");
  const isAudio = normalizedType.startsWith("audio/");
  const isPdf = normalizedType === "application/pdf";

  return (
    <div className="evidence-viewer">
      {/* Evidence file card */}
      <div className="authority-evidence-card">
        <div>
          <strong>{fileName}</strong>

          <p>{fileType || "Unknown file type"}</p>
        </div>

        {!url && (
          <button
            type="button"
            className="secondary-button"
            onClick={handleView}
            disabled={loading}
          >
            {loading ? "Opening..." : "View Evidence"}
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="evidence-viewer-error">
          {error}
        </p>
      )}

      {/* Large Evidence Viewer */}
      {url && (
        <div className="evidence-preview">
          <div className="evidence-preview-header">
            <div>
              <span className="evidence-preview-label">
                EVIDENCE PREVIEW
              </span>

              <strong>{fileName}</strong>
            </div>

            <button
              type="button"
              className="evidence-close-button"
              onClick={() => setUrl("")}
            >
              ✕ Close
            </button>
          </div>

          {/* Image */}
          {isImage && (
            <div className="evidence-media-container">
              <img
                src={url}
                alt={fileName}
                className="evidence-image-preview"
              />
            </div>
          )}

          {/* Video */}
          {isVideo && (
            <div className="evidence-media-container">
              <video
                src={url}
                controls
                className="evidence-video-preview"
              />
            </div>
          )}

          {/* Audio */}
          {isAudio && (
            <div className="evidence-audio-container">
              <audio
                src={url}
                controls
                className="evidence-audio-preview"
              />
            </div>
          )}

          {/* PDF */}
          {isPdf && (
            <div className="evidence-pdf-container">
              <iframe
                src={`${url}#toolbar=0`}
                title={fileName}
                className="evidence-pdf-preview"
              />
            </div>
          )}

          {/* Unsupported */}
          {!isImage &&
            !isVideo &&
            !isAudio &&
            !isPdf && (
              <div className="evidence-preview-unavailable">
                <strong>Preview unavailable</strong>

                <p>
                  This file type cannot be previewed in
                  the browser.
                </p>
              </div>
            )}
        </div>
      )}
    </div>
  );
}