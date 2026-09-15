"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";

type StepOneData = {
  category: string;
  description: string;
};

export default function IncidentDetailsPage() {
  const router = useRouter();

  const [incidentDate, setIncidentDate] = useState("");
  const [incidentTime, setIncidentTime] = useState("");
  const [timeNotKnown, setTimeNotKnown] = useState(false);

  const [incidentMethods, setIncidentMethods] = useState("");
  const [detailedDescription, setDetailedDescription] = useState("");
  const [frequency, setFrequency] = useState("");
  const [immediateDanger, setImmediateDanger] = useState(false);

  const [locationAddress, setLocationAddress] = useState("");
  const [cityDistrict, setCityDistrict] = useState("");

  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(
    null
  );

  const [locationLoading, setLocationLoading] = useState(false);
  const [locationMessage, setLocationMessage] = useState("");

  const [error, setError] = useState("");
  const [stepOneData, setStepOneData] =
    useState<StepOneData | null>(null);

  useEffect(() => {
    const savedData = sessionStorage.getItem(
      "janaraksha-complaint-step-1"
    );

    if (!savedData) {
      router.replace("/user/register-complaint");
      return;
    }

    try {
      const parsedData = JSON.parse(savedData);

      if (!parsedData.category || !parsedData.description) {
        router.replace("/user/register-complaint");
        return;
      }

      setStepOneData(parsedData);
    } catch {
      router.replace("/user/register-complaint");
    }
  }, [router]);

  async function handleUseCurrentLocation() {
    setError("");
    setLocationMessage("");

    if (!navigator.geolocation) {
      setError(
        "Location services are not supported by this browser."
      );
      return;
    }

    setLocationLoading(true);
    setLocationMessage("Getting your current location...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const {
          latitude: currentLatitude,
          longitude: currentLongitude,
          accuracy,
        } = position.coords;

        setLatitude(currentLatitude);
        setLongitude(currentLongitude);
        setLocationAccuracy(accuracy);

        try {
          const response = await fetch(
            `/api/reverse-geocode?lat=${currentLatitude}&lon=${currentLongitude}`
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(
              data.error || "Unable to determine address."
            );
          }

          setLocationAddress(data.address || "");

          const city = data.city || "";
          const district = data.district || "";

          if (city && district && city !== district) {
            setCityDistrict(`${city}, ${district}`);
          } else {
            setCityDistrict(city || district);
          }

          setLocationMessage("Location detected successfully.");
        } catch (lookupError) {
          console.error("Location lookup error:", lookupError);

          setLocationMessage(
            "Coordinates detected, but address could not be determined. You can enter the address manually."
          );
        } finally {
          setLocationLoading(false);
        }
      },
      (locationError) => {
        setLocationLoading(false);

        if (locationError.code === 1) {
          setLocationMessage(
            "Location permission was denied. You can enter the location manually."
          );
          return;
        }

        if (locationError.code === 2) {
          setLocationMessage(
            "Your location could not be determined. Please enter it manually."
          );
          return;
        }

        if (locationError.code === 3) {
          setLocationMessage(
            "Location request timed out. Please try again or enter it manually."
          );
          return;
        }

        setLocationMessage(
          "Unable to get your current location. Please enter it manually."
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  }

  function handleContinue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!stepOneData) {
      setError("Complaint information could not be loaded.");
      return;
    }

    if (!incidentDate) {
      setError("Please select the incident date.");
      return;
    }

    if (!timeNotKnown && !incidentTime) {
      setError(
        "Please select the incident time or choose Time not known."
      );
      return;
    }

    if (!detailedDescription.trim()) {
      setError("Please provide a detailed description.");
      return;
    }

    const complaintDraft = {
      ...stepOneData,

      incident_date: incidentDate,
      incident_time: timeNotKnown ? "" : incidentTime,
      time_not_known: timeNotKnown,

      incident_methods: incidentMethods.trim(),
      detailed_description: detailedDescription.trim(),
      frequency,

      immediate_danger: immediateDanger,

      location_address: locationAddress.trim(),
      city_district: cityDistrict.trim(),

      latitude,
      longitude,
      location_accuracy: locationAccuracy,
    };

    sessionStorage.setItem(
      "janaraksha-complaint-draft",
      JSON.stringify(complaintDraft)
    );

    router.push("/user/register-complaint/people");
  }

  function handleBack() {
    router.push("/user/register-complaint");
  }

  return (
    <main className="dashboard">
      <Sidebar activeItem="Register Complaint" />

      <section className="dashboard-content">
        <header className="dashboard-header">
          <div>
            <p className="page-label">REGISTER COMPLAINT</p>

            <h1>Incident Details</h1>

            <p className="header-description">
              Provide more information about the incident.
            </p>
          </div>
        </header>

        <form
          className="complaint-form-card"
          onSubmit={handleContinue}
        >
          {/* Incident Date */}

          <div className="form-section">
            <label htmlFor="incidentDate">
              Incident Date
            </label>

            <input
              id="incidentDate"
              type="date"
              value={incidentDate}
              onChange={(event) =>
                setIncidentDate(event.target.value)
              }
            />
          </div>

          {/* Incident Time */}

          <div className="form-section">
            <label htmlFor="incidentTime">
              Incident Time
            </label>

            <input
              id="incidentTime"
              type="time"
              value={incidentTime}
              disabled={timeNotKnown}
              onChange={(event) =>
                setIncidentTime(event.target.value)
              }
            />

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={timeNotKnown}
                onChange={(event) => {
                  setTimeNotKnown(event.target.checked);

                  if (event.target.checked) {
                    setIncidentTime("");
                  }
                }}
              />

              <span>Time not known</span>
            </label>
          </div>

          {/* Incident Methods */}

          <div className="form-section">
            <label htmlFor="incidentMethods">
              Incident Methods
            </label>

            <input
              id="incidentMethods"
              type="text"
              value={incidentMethods}
              onChange={(event) =>
                setIncidentMethods(event.target.value)
              }
              placeholder="For example: phone call, message, physical contact..."
            />
          </div>

          {/* Detailed Description */}

          <div className="form-section">
            <label htmlFor="detailedDescription">
              Detailed Description
            </label>

            <textarea
              id="detailedDescription"
              value={detailedDescription}
              onChange={(event) =>
                setDetailedDescription(event.target.value)
              }
              placeholder="Explain the incident in detail..."
              rows={7}
            />
          </div>

          {/* Frequency */}

          <div className="form-section">
            <label htmlFor="frequency">
              Frequency
            </label>

            <select
              id="frequency"
              value={frequency}
              onChange={(event) =>
                setFrequency(event.target.value)
              }
            >
              <option value="">Select frequency</option>
              <option value="One-time">One-time</option>
              <option value="Occasional">Occasional</option>
              <option value="Frequent">Frequent</option>
              <option value="Ongoing">Ongoing</option>
            </select>
          </div>

          {/* Immediate Danger */}

          <div className="form-section">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={immediateDanger}
                onChange={(event) =>
                  setImmediateDanger(event.target.checked)
                }
              />

              <span>
                I am currently in immediate danger
              </span>
            </label>
          </div>

          {/* Location */}

          <div className="form-section">
            <label>
              Location / Address
            </label>

            <button
              type="button"
              className="location-button"
              onClick={handleUseCurrentLocation}
              disabled={locationLoading}
            >
              <span>⌖</span>

              {locationLoading
                ? "Detecting Location..."
                : "Use Current Location"}
            </button>

            {locationMessage && (
              <p className="location-message">
                {locationMessage}
              </p>
            )}

            <input
              id="locationAddress"
              type="text"
              value={locationAddress}
              onChange={(event) =>
                setLocationAddress(event.target.value)
              }
              placeholder="Enter the incident location"
            />
          </div>

          <div className="form-section">
            <label htmlFor="cityDistrict">
              City / District
            </label>

            <input
              id="cityDistrict"
              type="text"
              value={cityDistrict}
              onChange={(event) =>
                setCityDistrict(event.target.value)
              }
              placeholder="Enter city or district"
            />
          </div>

          {/* Location Attribution */}

          <p className="location-attribution">
            Location information may be automatically determined from
            your device location. You can edit the detected information
            manually.
          </p>

          {error && (
            <p className="form-error">
              {error}
            </p>
          )}

          {/* Actions */}

          <div className="form-actions form-actions-between">
            <button
              type="button"
              className="secondary-button"
              onClick={handleBack}
            >
              ← Back
            </button>

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