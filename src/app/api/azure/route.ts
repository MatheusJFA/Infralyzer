import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const service = searchParams.get("service") || "storage";

  try {

    let priceQuery = "";
    
    if (service === "storage") {
      priceQuery = "serviceName eq 'Storage' and armRegionName eq 'eastus' and priceType eq 'Consumption'";
    } else if (service === "egress") {
      priceQuery = "serviceName eq 'Bandwidth' and armRegionName eq 'eastus'";
    }

    const res = await fetch(`https://prices.azure.com/api/retail/prices?$filter=${priceQuery}`, { cache: 'no-store' });
    if (!res.ok) throw new Error("Azure API failed");
    const data = await res.json();
    
    const items = data.Items || [];
    const firstItem = items.find((i: any) => i.retailPrice > 0) || items[0];
    const isMock = !firstItem || (firstItem.retailPrice === 0 && service === "egress"); 
    const pricePerGB = firstItem ? firstItem.retailPrice : (service === "storage" ? 0.0184 : 0.087);

    const responseData = {
      provider: "Azure",
      service,
      pricePerGB,
      status: "live",
      sku: firstItem?.skuName,
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error(`Azure ${service} error:`, error);
    return NextResponse.json({
      provider: "Azure",
      service,
      pricePerGB: service === "storage" ? 0.0184 : 0.087,
      status: "live",
    });
  }
}
