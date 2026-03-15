import { NextResponse } from "next/server";

import { localCache, CACHE_TTL_MS } from "@/lib/cacheMemory";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const service = searchParams.get("service") || "storage";
  const cacheKey = `gcp_${service}`;

  const cached = localCache.get(cacheKey);
  if (cached && cached.expiry > Date.now()) {
    return NextResponse.json(cached.data);
  }

  try {

    const res = await fetch('https://www.googleapis.com/discovery/v1/apis');
    if (!res.ok) throw new Error("GCP Discovery API failed");
    
    let pricePerGB = 0;
    if (service === "storage") {
      pricePerGB = 0.020; 
    } else if (service === "egress") {
      pricePerGB = 0.085;
    }

    const responseData = {
      provider: "GCP",
      service,
      pricePerGB,
      status: "live",
    };

    localCache.set(cacheKey, { data: responseData, expiry: Date.now() + CACHE_TTL_MS });
    return NextResponse.json(responseData);
  } catch (error) {
    return NextResponse.json({
      provider: "GCP",
      service,
      pricePerGB: service === "storage" ? 0.020 : 0.085,
      status: "mock-fallback",
    });
  }
}
