import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Person = {
  involved_type?: string;
  full_name?: string;
  alias?: string;
  contact?: string;
  age?: string;
  address?: string;
  relationship?: string;
  known_from?: string;
  position_of_power?: string;
  other_information?: string;
};

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    /*
     * =========================================
     * 1. VERIFY USER
     * =========================================
     */

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          success: false,
          error:
            "You must be logged in to submit a complaint.",
        },
        { status: 401 }
      );
    }

    /*
     * =========================================
     * 2. READ FORM DATA
     * =========================================
     */

    const formData = await request.formData();

    /*
     * =========================================
     * 3. READ COMPLAINT FIELDS
     * =========================================
     */

    const category =
      String(formData.get("category") || "").trim();

    const description =
      String(formData.get("description") || "").trim();

    const incidentDate =
      String(formData.get("incidentDate") || "");

    const incidentTime =
      String(formData.get("incidentTime") || "");

    const timeNotKnown =
      String(
        formData.get("timeNotKnown") || "false"
      ) === "true";

    const incidentMethods =
      String(
        formData.get("incidentMethods") || ""
      ).trim();

    const detailedDescription =
      String(
        formData.get("detailedDescription") || ""
      ).trim();

    const frequency =
      String(
        formData.get("frequency") || ""
      ).trim();

    const immediateDanger =
      String(
        formData.get("immediateDanger") || "false"
      ) === "true";

    const locationAddress =
      String(
        formData.get("locationAddress") || ""
      ).trim();

    const cityDistrict =
      String(
        formData.get("cityDistrict") || ""
      ).trim();

    const latitudeValue =
      formData.get("latitude");

    const longitudeValue =
      formData.get("longitude");

    const accuracyValue =
      formData.get("locationAccuracy");

    const latitude =
      latitudeValue !== null &&
      String(latitudeValue) !== ""
        ? Number(latitudeValue)
        : null;

    const longitude =
      longitudeValue !== null &&
      String(longitudeValue) !== ""
        ? Number(longitudeValue)
        : null;

    const locationAccuracy =
      accuracyValue !== null &&
      String(accuracyValue) !== ""
        ? Number(accuracyValue)
        : null;

    /*
     * =========================================
     * 4. VALIDATE
     * =========================================
     */

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          error: "Incident type is required.",
        },
        { status: 400 }
      );
    }

    if (!description) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Incident description is required.",
        },
        { status: 400 }
      );
    }

    /*
     * =========================================
     * 5. READ PEOPLE
     * =========================================
     */

    let people: Person[] = [];

    const peopleValue =
      formData.get("people");

    if (
      peopleValue &&
      typeof peopleValue === "string"
    ) {
      try {
        const parsed =
          JSON.parse(peopleValue);

        if (Array.isArray(parsed)) {
          people = parsed;
        }
      } catch (error) {
        console.error(
          "People parsing error:",
          error
        );

        return NextResponse.json(
          {
            success: false,
            error:
              "People information could not be processed.",
          },
          { status: 400 }
        );
      }
    }

    console.log(
      "PEOPLE RECEIVED:",
      people.length
    );

    /*
     * =========================================
     * 6. READ EVIDENCE FILES
     * =========================================
     */

    const evidenceFiles = formData
      .getAll("evidence")
      .filter(
        (item): item is File =>
          item instanceof File &&
          item.size > 0
      );

    console.log(
      "EVIDENCE FILES RECEIVED:",
      evidenceFiles.length
    );

    /*
     * =========================================
     * 7. CREATE COMPLAINT
     * =========================================
     */

    const {
      data: complaint,
      error: complaintError,
    } = await supabase
      .from("complaints")
      .insert({
        user_id: user.id,

        category,

        description,

        incident_date:
          incidentDate || null,

        incident_time:
          timeNotKnown
            ? null
            : incidentTime || null,

        time_not_known:
          timeNotKnown,

        incident_methods:
          incidentMethods || null,

        detailed_description:
          detailedDescription || null,

        frequency:
          frequency || null,

        immediate_danger:
          immediateDanger,

        location_address:
          locationAddress || null,

        city_district:
          cityDistrict || null,

        latitude,

        longitude,

        location_accuracy:
          locationAccuracy,
      })
      .select(
        "id, complaint_number, status, priority"
      )
      .single();

    if (complaintError || !complaint) {
      console.error(
        "COMPLAINT CREATION ERROR:",
        complaintError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Unable to create the complaint.",
          details:
            complaintError?.message ||
            "Complaint was not created.",
          code:
            complaintError?.code || null,
        },
        { status: 500 }
      );
    }

    console.log(
      "COMPLAINT CREATED:",
      complaint.complaint_number
    );

    /*
     * =========================================
     * 8. SAVE PEOPLE
     * =========================================
     */

    if (people.length > 0) {
      const peopleRows = people.map(
        (person) => ({
          complaint_id: complaint.id,

          involved_type:
            person.involved_type?.trim() ||
            null,

          full_name:
            person.full_name?.trim() ||
            null,

          alias:
            person.alias?.trim() ||
            null,

          contact:
            person.contact?.trim() ||
            null,

          age:
            person.age?.trim() ||
            null,

          address:
            person.address?.trim() ||
            null,

          relationship:
            person.relationship?.trim() ||
            null,

          known_from:
            person.known_from?.trim() ||
            null,

          position_of_power:
            person.position_of_power?.trim() ||
            null,

          other_information:
            person.other_information?.trim() ||
            null,
        })
      );

      const {
        error: peopleError,
      } = await supabase
        .from("complaint_people")
        .insert(peopleRows);

      if (peopleError) {
        console.error(
          "PEOPLE INSERTION ERROR:",
          peopleError
        );

        return NextResponse.json(
          {
            success: false,
            error:
              "People information could not be saved.",
            details:
              peopleError.message,
            code:
              peopleError.code,
          },
          { status: 500 }
        );
      }

      console.log(
        "PEOPLE SAVED:",
        people.length
      );
    }

    /*
     * =========================================
     * 9. UPLOAD EVIDENCE
     * =========================================
     */

    for (const file of evidenceFiles) {
      const extension =
        file.name.includes(".")
          ? file.name
              .split(".")
              .pop()
              ?.toLowerCase() || ""
          : "";

      const uniqueName =
        extension
          ? `${crypto.randomUUID()}.${extension}`
          : crypto.randomUUID();

      /*
       * Internal UUID is used only for
       * Storage path.
       */

      const storagePath =
        `${complaint.id}/${uniqueName}`;

      console.log(
        "UPLOADING EVIDENCE:",
        file.name
      );

      const {
        error: uploadError,
      } = await supabase.storage
        .from("complaint-evidence")
        .upload(
          storagePath,
          file,
          {
            contentType:
              file.type ||
              "application/octet-stream",

            upsert: false,
          }
        );

      if (uploadError) {
        console.error(
          "EVIDENCE UPLOAD ERROR:",
          uploadError
        );

        return NextResponse.json(
          {
            success: false,
            error:
              `Unable to upload evidence: ${file.name}`,
            details:
              uploadError.message,
          },
          { status: 500 }
        );
      }

      console.log(
        "EVIDENCE UPLOADED:",
        storagePath
      );

      /*
       * =====================================
       * 10. SAVE EVIDENCE METADATA
       * =====================================
       */

      const {
        error: evidenceError,
      } = await supabase
        .from("complaint_evidence")
        .insert({
          complaint_id:
            complaint.id,

          file_name:
            file.name,

          file_size:
            file.size,

          file_type:
            file.type ||
            "application/octet-stream",

          evidence_type:
            "Other",

          storage_path:
            storagePath,
        });

      if (evidenceError) {
        console.error(
          "EVIDENCE METADATA ERROR:",
          evidenceError
        );

        return NextResponse.json(
          {
            success: false,
            error:
              `Evidence information could not be saved: ${file.name}`,
            details:
              evidenceError.message,
            code:
              evidenceError.code,
          },
          { status: 500 }
        );
      }

      console.log(
        "EVIDENCE METADATA SAVED:",
        file.name
      );
    }

    /*
     * =========================================
     * 11. SUCCESS
     * =========================================
     */

    console.log(
      "SUBMISSION SUCCESS:",
      complaint.complaint_number
    );

    return NextResponse.json(
      {
        success: true,

        complaint: {
          complaint_number:
            complaint.complaint_number,

          status:
            complaint.status,

          priority:
            complaint.priority,
        },

        people_count:
          people.length,

        evidence_count:
          evidenceFiles.length,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "========================================="
    );

    console.error(
      "COMPLAINT SUBMISSION ERROR:",
      error
    );

    console.error(
      "========================================="
    );

    return NextResponse.json(
      {
        success: false,

        error:
          "Something went wrong while submitting the complaint.",

        details:
          error instanceof Error
            ? error.message
            : "Unknown server error.",
      },
      { status: 500 }
    );
  }
}