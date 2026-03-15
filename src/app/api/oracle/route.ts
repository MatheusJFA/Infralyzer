import { NextResponse } from "next/server";

import { localCache, CACHE_TTL_MS } from "@/lib/cacheMemory";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const service = searchParams.get("service") || "storage";
  const cacheKey = `oracle_${service}`;

  const cached = localCache.get(cacheKey);
  if (cached && cached.expiry > Date.now()) {
    return NextResponse.json(cached.data);
  }

  try {

    const res = await fetch('https://apexapps.oracle.com/pls/apex/cetools/api/v1/products/', { cache: 'no-store' });
    if (!res.ok) throw new Error("Oracle API failed");
    const data = await res.json();
    
    let pricePerGB = 0;
    let isMock = false;
    if (service === "storage") {
      const storageProduct = data.items?.find((p: any) => 
        (p.displayName && p.displayName.includes("Object Storage")) || 
        (p.metricName && p.metricName.includes("Storage Capacity"))
      );
      const priceVal = storageProduct?.currencyCodeLocalizations?.find((c: any) => c.currencyCode === "USD")?.prices?.[0]?.value;
      pricePerGB = priceVal || 0.0255;
      isMock = !priceVal;
    } else if (service === "egress") {
      const egressProduct = data.items?.find((p: any) => 
        (p.displayName && p.displayName.includes("Outbound Data Transfer")) ||
        (p.description && p.description.includes("Outbound Data Transfer"))
      );
      const priceVal = egressProduct?.currencyCodeLocalizations?.find((c: any) => c.currencyCode === "USD")?.prices?.[0]?.value;
      pricePerGB = priceVal || 0.0085;
      isMock = !priceVal;
    }

    const responseData = {
      provider: "Oracle",
      service,
      pricePerGB,
      status: isMock ? "mock" : "live",
    };

    localCache.set(cacheKey, { data: responseData, expiry: Date.now() + CACHE_TTL_MS });
    return NextResponse.json(responseData);

  } catch (error) {
    let pricePerGB = 0;
    if (service === "storage") pricePerGB = 0.0255;
    else if (service === "egress") pricePerGB = 0.0085;

    return NextResponse.json({
      provider: "Oracle",
      service,
      pricePerGB,
      status: "mock-fallback",
    });
  }
}
