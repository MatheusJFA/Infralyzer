import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const service = searchParams.get("service") || "storage";

  try {
    // Oracle Public Price List API
    const res = await fetch('https://apexapps.oracle.com/pls/apex/cetools/api/v1/products/');
    if (!res.ok) throw new Error("Oracle API failed");
    const data = await res.json();
    
    let pricePerGB = 0;
    
    if (service === "storage") {
      // Procurando pelo 'Object Storage - Storage' que normalmente é a métrica principal no JSON deles
      const storageProduct = data.items?.find((p: any) => p.description && p.description.includes("Object Storage - Storage"));
      // Tentar pegar do first price model list, ou fallback matemático 0.0255
      pricePerGB = storageProduct?.currencyCodeLocalizations?.[0]?.prices?.[0]?.value || 0.0255;
    } else if (service === "egress") {
      // Outbound Data Transfer
      const egressProduct = data.items?.find((p: any) => p.description && p.description.includes("Outbound Data Transfer"));
      pricePerGB = egressProduct?.currencyCodeLocalizations?.[0]?.prices?.[0]?.value || 0.0085;
    }

    return NextResponse.json({
      provider: "Oracle",
      service,
      pricePerGB,
      status: "live",
    });

  } catch (error) {
    // Fallback Mock
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
