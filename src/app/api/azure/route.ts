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
      priceQuery = "serviceName eq 'Bandwidth' and meterName eq 'Standard Data Transfer Out' and armRegionName eq 'eastus'";
    }

    const res = await fetch(`https://prices.azure.com/api/retail/prices?$filter=${priceQuery}`, { cache: 'no-store' });
    if (!res.ok) throw new Error("Azure API failed");
    const data = await res.json();
    
    // Captura primeiro item do retorno da Microsoft com preço (evitando tier 0-5GB free se existir no index)
    const items = data.Items || [];
    const firstItem = items.find((i: any) => i.retailPrice > 0) || items[0];
    const isMock = !firstItem || (firstItem.retailPrice === 0 && service === "egress"); 
    const pricePerGB = firstItem ? firstItem.retailPrice : (service === "storage" ? 0.0184 : 0.087);

    return NextResponse.json({
      provider: "Azure",
      service,
      pricePerGB,
      status: isMock ? "mock" : "live",
      sku: firstItem?.skuName,
    });
  } catch (error) {
    console.error(`Azure ${service} error:`, error);
    return NextResponse.json({
      provider: "Azure",
      service,
      pricePerGB: service === "storage" ? 0.0184 : 0.087,
      status: "mock",
    });
  }
}
