import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getSession();

  return NextResponse.json({
    connected: !error,
    hasSession: !!data.session,
    error: error?.message ?? null,
  });
}