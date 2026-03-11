import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const service = searchParams.get("service") || "storage";

  try {
    let priceQuery = "";
    
    // Filtros de OData para a API Retail Oficial da Azure (US East)
    if (service === "storage") {
      // General Block Blob, Hot Tier, LRS em East US
      priceQuery = "serviceName eq 'Storage' and meterName eq 'Hot LRS Data Stored' and armRegionName eq 'eastus'";
    } else if (service === "egress") {
      // Bandwidth saindo de East US para a Internet
      priceQuery = "serviceName eq 'Bandwidth' and meterName eq 'Data Transfer Out' and armRegionName eq 'eastus'";
    }

    const res = await fetch(`https://prices.azure.com/api/retail/prices?$filter=${priceQuery}`);
    if (!res.ok) throw new Error("Azure API failed");
    const data = await res.json();
    
    // Captura primeiro item do retorno da Microsoft
    const firstItem = data.Items && data.Items[0];
    const pricePerGB = firstItem ? firstItem.retailPrice : (service === "storage" ? 0.0184 : 0.087);

    return NextResponse.json({
      provider: "Azure",
      service,
      pricePerGB,
      status: "live",
      sku: firstItem ? firstItem.skuName : undefined,
    });
  } catch (error) {
    // Fallback p/ Mock caso restrição de rede
    return NextResponse.json({
      provider: "Azure",
      service,
      pricePerGB: service === "storage" ? 0.0184 : 0.087,
      status: "mock-fallback",
    });
  }
}
