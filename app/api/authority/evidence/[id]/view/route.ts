import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type RouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  request: Request,
  { params }: RouteProps
) {
  try {
    const { id } = await params;

    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required.",
        },
        { status: 401 }
      );
    }

    const { data: profile, error: profileError } =
      await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profileError || !profile) {
      return NextResponse.json(
        {
          success: false,
          error: "Unable to verify authority access.",
        },
        { status: 403 }
      );
    }

    if (profile.role !== "AUTHORITY") {
      return NextResponse.json(
        {
          success: false,
          error: "You are not authorized to view evidence.",
        },
        { status: 403 }
      );
    }

    const { data: evidence, error: evidenceError } =
      await supabase
        .from("complaint_evidence")
        .select(
          "id, complaint_id, file_name, file_type, storage_path"
        )
        .eq("id", id)
        .single();

    if (evidenceError || !evidence) {
      return NextResponse.json(
        {
          success: false,
          error: "Evidence not found.",
        },
        { status: 404 }
      );
    }

    const { data: signedUrlData, error: signedUrlError } =
      await supabase.storage
        .from("complaint-evidence")
        .createSignedUrl(
          evidence.storage_path,
          60 * 5
        );

    if (signedUrlError || !signedUrlData) {
      console.error(
        "Signed URL error:",
        signedUrlError
      );

      return NextResponse.json(
        {
          success: false,
          error: "Unable to open evidence.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: signedUrlData.signedUrl,
      fileName: evidence.file_name,
      fileType: evidence.file_type,
    });
  } catch (error) {
    console.error(
      "Evidence view error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: "Something went wrong.",
      },
      { status: 500 }
    );
  }
}