"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";

type Person = {
  involved_type: string;
  full_name: string;
  alias: string;
  contact: string;
  age: string;
  address: string;
  relationship: string;
  known_from: string;
  position_of_power: string;
  other_information: string;
};

const involvedTypeOptions = [
  "Victim",
  "Witness",
  "Suspect",
  "Other",
];

const emptyPerson: Person = {
  involved_type: "",
  full_name: "",
  alias: "",
  contact: "",
  age: "",
  address: "",
  relationship: "",
  known_from: "",
  position_of_power: "",
  other_information: "",
};

export default function PeoplePage() {
  const router = useRouter();

  const [hasPeople, setHasPeople] = useState<boolean | null>(null);
  const [people, setPeople] = useState<Person[]>([]);
  const [currentPerson, setCurrentPerson] =
    useState<Person>(emptyPerson);

  const [error, setError] = useState("");

  useEffect(() => {
    const draft = sessionStorage.getItem(
      "janaraksha-complaint-draft"
    );

    if (!draft) {
      router.replace("/user/register-complaint");
      return;
    }

    try {
      const parsedDraft = JSON.parse(draft);

      if (Array.isArray(parsedDraft.people)) {
        setPeople(parsedDraft.people);
      }
    } catch {
      router.replace("/user/register-complaint");
    }
  }, [router]);

  function handleSavePerson(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!currentPerson.involved_type) {
      setError("Please select the person's involvement type.");
      return;
    }

    if (!currentPerson.full_name.trim()) {
      setError("Please enter the person's name.");
      return;
    }

    const updatedPeople = [
      ...people,
      {
        ...currentPerson,
        full_name: currentPerson.full_name.trim(),
        alias: currentPerson.alias.trim(),
        contact: currentPerson.contact.trim(),
        age: currentPerson.age.trim(),
        address: currentPerson.address.trim(),
        relationship: currentPerson.relationship.trim(),
        known_from: currentPerson.known_from.trim(),
        position_of_power:
          currentPerson.position_of_power.trim(),
        other_information:
          currentPerson.other_information.trim(),
      },
    ];

    setPeople(updatedPeople);
    setCurrentPerson(emptyPerson);
  }

  function handleRemovePerson(index: number) {
    setPeople((currentPeople) =>
      currentPeople.filter((_, personIndex) => personIndex !== index)
    );
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

      sessionStorage.setItem(
        "janaraksha-complaint-draft",
        JSON.stringify({
          ...parsedDraft,
          people,
        })
      );

      router.push("/user/register-complaint/evidence");
    } catch {
      setError("Unable to save complaint information.");
    }
  }

  function handleBack() {
    router.push("/user/register-complaint/details");
  }

  return (
    <main className="dashboard">
      <Sidebar activeItem="Register Complaint" />

      <section className="dashboard-content">
        <header className="dashboard-header">
          <div>
            <p className="page-label">REGISTER COMPLAINT</p>

            <h1>People & Information</h1>

            <p className="header-description">
              Add information about people involved in the incident,
              if applicable.
            </p>
          </div>
        </header>

        <section className="complaint-form-card">
          <div className="form-section">
            <label>
              Are there any people involved in this incident?
            </label>

            <label className="checkbox-label">
              <input
                type="radio"
                name="hasPeople"
                checked={hasPeople === true}
                onChange={() => {
                  setHasPeople(true);
                  setError("");
                }}
              />
              Yes
            </label>

            <label className="checkbox-label">
              <input
                type="radio"
                name="hasPeople"
                checked={hasPeople === false}
                onChange={() => {
                  setHasPeople(false);
                  setError("");
                  setPeople([]);
                  setCurrentPerson(emptyPerson);
                }}
              />
              No
            </label>
          </div>

          {hasPeople === true && (
            <>
              <form onSubmit={handleSavePerson}>
                <div className="form-section">
                  <label htmlFor="involvedType">
                    Involved Type
                  </label>

                  <select
                    id="involvedType"
                    value={currentPerson.involved_type}
                    onChange={(event) =>
                      setCurrentPerson({
                        ...currentPerson,
                        involved_type: event.target.value,
                      })
                    }
                  >
                    <option value="">
                      Select involvement type
                    </option>

                    {involvedTypeOptions.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-section">
                  <label htmlFor="fullName">
                    Full Name
                  </label>

                  <input
                    id="fullName"
                    type="text"
                    value={currentPerson.full_name}
                    onChange={(event) =>
                      setCurrentPerson({
                        ...currentPerson,
                        full_name: event.target.value,
                      })
                    }
                    placeholder="Enter full name"
                  />
                </div>

                <div className="form-section">
                  <label htmlFor="alias">
                    Alias
                  </label>

                  <input
                    id="alias"
                    type="text"
                    value={currentPerson.alias}
                    onChange={(event) =>
                      setCurrentPerson({
                        ...currentPerson,
                        alias: event.target.value,
                      })
                    }
                    placeholder="Enter alias, if known"
                  />
                </div>

                <div className="form-section">
                  <label htmlFor="contact">
                    Contact
                  </label>

                  <input
                    id="contact"
                    type="text"
                    value={currentPerson.contact}
                    onChange={(event) =>
                      setCurrentPerson({
                        ...currentPerson,
                        contact: event.target.value,
                      })
                    }
                    placeholder="Phone number or other contact"
                  />
                </div>

                <div className="form-section">
                  <label htmlFor="age">
                    Age
                  </label>

                  <input
                    id="age"
                    type="text"
                    value={currentPerson.age}
                    onChange={(event) =>
                      setCurrentPerson({
                        ...currentPerson,
                        age: event.target.value,
                      })
                    }
                    placeholder="Enter age, if known"
                  />
                </div>

                <div className="form-section">
                  <label htmlFor="address">
                    Address
                  </label>

                  <input
                    id="address"
                    type="text"
                    value={currentPerson.address}
                    onChange={(event) =>
                      setCurrentPerson({
                        ...currentPerson,
                        address: event.target.value,
                      })
                    }
                    placeholder="Enter address, if known"
                  />
                </div>

                <div className="form-section">
                  <label htmlFor="relationship">
                    Relationship
                  </label>

                  <input
                    id="relationship"
                    type="text"
                    value={currentPerson.relationship}
                    onChange={(event) =>
                      setCurrentPerson({
                        ...currentPerson,
                        relationship: event.target.value,
                      })
                    }
                    placeholder="Relationship to the complainant"
                  />
                </div>

                <div className="form-section">
                  <label htmlFor="knownFrom">
                    Known From
                  </label>

                  <input
                    id="knownFrom"
                    type="text"
                    value={currentPerson.known_from}
                    onChange={(event) =>
                      setCurrentPerson({
                        ...currentPerson,
                        known_from: event.target.value,
                      })
                    }
                    placeholder="How do you know this person?"
                  />
                </div>

                <div className="form-section">
                  <label htmlFor="positionOfPower">
                    Position of Power
                  </label>

                  <input
                    id="positionOfPower"
                    type="text"
                    value={currentPerson.position_of_power}
                    onChange={(event) =>
                      setCurrentPerson({
                        ...currentPerson,
                        position_of_power: event.target.value,
                      })
                    }
                    placeholder="Enter position, if applicable"
                  />
                </div>

                <div className="form-section">
                  <label htmlFor="otherInformation">
                    Other Information
                  </label>

                  <textarea
                    id="otherInformation"
                    value={currentPerson.other_information}
                    onChange={(event) =>
                      setCurrentPerson({
                        ...currentPerson,
                        other_information: event.target.value,
                      })
                    }
                    placeholder="Add any other relevant information..."
                    rows={5}
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
                    className="secondary-button"
                  >
                    + Save Person
                  </button>
                </div>
              </form>

              {people.length > 0 && (
                <div>
                  <h2>Added People</h2>

                  {people.map((person, index) => (
                    <div key={index}>
                      <p>
                        <strong>{person.full_name}</strong>
                      </p>

                      <p>
                        {person.involved_type}
                      </p>

                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() =>
                          handleRemovePerson(index)
                        }
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {error && hasPeople !== true && (
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
              disabled={hasPeople === null}
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