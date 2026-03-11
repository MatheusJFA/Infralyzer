import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const service = searchParams.get("service") || "storage";

  let pricePerGB = 0;
  if (service === "storage") pricePerGB = 0.023; // S3 Standard
  else if (service === "egress") pricePerGB = 0.09; // Data Transfer Out

  // Placeholder logic for AWS API Proxy
  return NextResponse.json({
    provider: "AWS",
    service,
    pricePerGB,
    status: "mock",
  });
}
