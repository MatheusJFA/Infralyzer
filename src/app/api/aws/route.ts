import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const service = searchParams.get("service") || "storage";

  try {
    // AWS Price List API for S3 in US East (N. Virginia)
    // Usando a URL direta regional que é menor (~400KB) que o bulk index
    const res = await fetch('https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonS3/current/us-east-1/index.json', { cache: 'no-store' });
    
    if (!res.ok) throw new Error("AWS Pricing API unreachable");
    
    let pricePerGB = 0;
    let isMock = false;

    if (service === "storage") {
      const res = await fetch('https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonS3/current/us-east-1/index.json', { cache: 'no-store' });
      if (!res.ok) throw new Error("AWS Storage API unreachable");
      const data = await res.json();

      // S3 Standard usage type is TimedStorage-ByteHrs
      const s3Standard = Object.values(data.products || {}).find((p: any) => 
        p.attributes?.usagetype === 'TimedStorage-ByteHrs' && 
        p.attributes?.location === 'US East (N. Virginia)'
      ) as any;

      if (s3Standard) {
        const sku = s3Standard.sku;
        const onDemand = data.terms?.OnDemand?.[sku];
        const priceDimensions = onDemand ? Object.values(Object.values(onDemand)[0] as any)[0] as any : null;
        const priceMap = priceDimensions?.pricePerUnit;
        pricePerGB = parseFloat(priceMap?.USD) || 0.023;
        isMock = !priceMap?.USD;
      } else {
        pricePerGB = 0.023;
        isMock = true;
      }
    } else if (service === "egress") {
      // Egress para Internet (Data Transfer Out)
      // Usando o index de Data Transfer que é onde fica o egress real
      const res = await fetch('https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AWSDataTransfer/current/us-east-1/index.json', { cache: 'no-store' });
      if (!res.ok) throw new Error("AWS Egress API unreachable");
      const data = await res.json();

      // Procura por Data Transfer Out para External
      const egressProd = Object.values(data.products || {}).find((p: any) => 
        p.attributes?.transferType === 'AWS Outbound' && 
        p.attributes?.fromLocation === 'US East (N. Virginia)'
      ) as any;

      if (egressProd) {
        const sku = egressProd.sku;
        const onDemand = data.terms?.OnDemand?.[sku];
        const priceDimensions = onDemand ? Object.values(Object.values(onDemand)[0] as any)[0] as any : null;
        const priceMap = priceDimensions?.pricePerUnit;
        pricePerGB = parseFloat(priceMap?.USD) || 0.09;
        isMock = !priceMap?.USD;
      } else {
        pricePerGB = 0.09;
        isMock = true;
      }
    }

    return NextResponse.json({
      provider: "AWS",
      service,
      pricePerGB,
      status: isMock ? "mock" : "live",
    });

  } catch (error) {
    console.error(`AWS ${service} error:`, error);
    return NextResponse.json({
      provider: "AWS",
      service,
      pricePerGB: service === "storage" ? 0.023 : 0.09,
      status: "mock",
    });
  }
}
