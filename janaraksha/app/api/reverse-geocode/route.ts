import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const latitude = searchParams.get("lat");
  const longitude = searchParams.get("lon");

  if (!latitude || !longitude) {
    return NextResponse.json(
      { error: "Latitude and longitude are required." },
      { status: 400 }
    );
  }

  const url = new URL(
    "https://nominatim.openstreetmap.org/reverse"
  );

  url.searchParams.set("lat", latitude);
  url.searchParams.set("lon", longitude);
  url.searchParams.set("format", "geocodejson");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("accept-language", "en");

  try {
    const response = await fetch(url.toString(), {
      headers: {
        "User-Agent": "JanaRaksha/1.0 (citizen complaint platform)",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Unable to determine the address." },
        { status: response.status }
      );
    }

    const data = await response.json();

    const geocoding = data?.features?.[0]?.properties?.geocoding;

    if (!geocoding) {
      return NextResponse.json(
        { error: "No address information was found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      address: geocoding.label || "",
      city: geocoding.city || "",
      district:
        geocoding.district ||
        geocoding.county ||
        "",
      state: geocoding.state || "",
    });
  } catch (error) {
    console.error("Reverse geocoding error:", error);

    return NextResponse.json(
      { error: "Location lookup failed." },
      { status: 500 }
    );
  }
}