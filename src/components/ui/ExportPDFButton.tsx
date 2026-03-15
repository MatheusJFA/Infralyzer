import React, { useState } from 'react';
import { TuiButton } from './TuiButton';
import { Download } from 'lucide-react';
import { useTranslation } from "@/lib/i18n/I18nContext";
import type { BusinessMetrics, InfrastructureProjections } from "@/types";

interface ExportPDFButtonProps {
  filename?: string;
  metrics: BusinessMetrics;
  projections: InfrastructureProjections;
  pricingData?: any;
}

export function ExportPDFButton({ filename = "infralyze-report.pdf", metrics, projections, pricingData }: ExportPDFButtonProps) {
  const { t } = useTranslation();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const { jsPDF } = await import('jspdf');

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const primaryColor = '#00ff00';
      const textColor = '#333333';
      const secondaryColor = '#666666';

      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(primaryColor);
      doc.text("> INFRALYZER REPORT", 14, 20);

      doc.setFontSize(10);
      doc.setTextColor(secondaryColor);
      doc.text(`Generated at: ${new Date().toLocaleString()}`, 14, 26);

      doc.setDrawColor(0, 255, 0);
      doc.setLineWidth(0.5);
      doc.line(14, 30, 196, 30);

      // Section: Business Metrics
      let yPos = 40;
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text("Business Metrics (Inputs)", 14, yPos);
      
      yPos += 8;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(textColor);
      const metricsList = [
        `Daily Active Users (DAU): ${metrics.DAU.toLocaleString()}`,
        `Requests per User/Day: ${metrics.RequestsPerUser}`,
        `Read / Write Ratio: ${metrics.ReadRatioPercentage}% / ${metrics.WriteRatioPercentage}%`,
        `Avg Write Payload: ${metrics.AvgPayloadSizeBytes} Bytes`,
        `Avg Read Response: ${metrics.AvgResponseSizeBytes} Bytes`,
        `Database Retention: ${metrics.RetentionDays} Days`,
        `Database Replication Factor: ${metrics.ReplicationFactor || 3}`
      ];

      metricsList.forEach(item => {
        doc.text(`• ${item}`, 14, yPos);
        yPos += 6;
      });

      yPos += 10;
      doc.setDrawColor(200, 200, 200);
      doc.line(14, yPos, 196, yPos);
      yPos += 10;

      // Section: Technical Projections
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text("Technical Projections", 14, yPos);
      
      yPos += 8;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(textColor);

      const projList = [
        `Avg QPS: ${Math.round(projections.avgQPS).toLocaleString()}`,
        `Peak QPS: ${Math.round(projections.peakQPS).toLocaleString()}`,
        `Read QPS: ${Math.round(projections.readQPS).toLocaleString()}`,
        `Write QPS: ${Math.round(projections.writeQPS).toLocaleString()}`,
      ];

      // Draw Projection Boxes Layout (emulated via text pairs)
      doc.text(projList[0], 14, yPos);
      doc.text(projList[1], 100, yPos);
      yPos += 8;
      doc.text(projList[2], 14, yPos);
      doc.text(projList[3], 100, yPos);
      
      yPos += 12;
      doc.setFont("helvetica", "bold");
      doc.text("Monthly Accumulation", 14, yPos);
      yPos += 8;
      doc.setFont("helvetica", "normal");
      doc.text(`Monthly Egress (Network): ${projections.totalEgressGB.toFixed(2)} GB`, 14, yPos);
      doc.text(`Database Storage (Total): ${projections.totalStorageGB.toFixed(2)} GB`, 100, yPos);

      yPos += 10;
      doc.setDrawColor(200, 200, 200);
      doc.line(14, yPos, 196, yPos);
      yPos += 10;

      // Section: Cloud Pricing
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text("Estimated Monthly Cloud Costs", 14, yPos);
      
      if (pricingData) {
        const { aws, azure, gcp, oracle, exchangeRate } = pricingData;
        
        yPos += 6;
        doc.setFont("helvetica", "italic");
        doc.setFontSize(9);
        doc.setTextColor(secondaryColor);
        doc.text(`Rates conversion applied: 1 USD = ${exchangeRate.toFixed(2)} BRL`, 14, yPos);
        yPos += 10;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        
        const renderCloudPrice = (name: string, data: any, startX: number) => {
          doc.setTextColor(0, 0, 0);
          doc.text(name, startX, yPos);
          
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          doc.setTextColor(secondaryColor);
          
          const totalUSD = (projections.totalStorageGB * data.storage) + (projections.totalEgressGB * data.egress);
          const totalBRL = totalUSD * exchangeRate;
          
          doc.text(`Storage (USD/GB): $${data.storage.toFixed(4)}`, startX, yPos + 6);
          doc.text(`Egress (USD/GB): $${data.egress.toFixed(4)}`, startX, yPos + 12);
          
          doc.setFont("helvetica", "bold");
          doc.setTextColor(0, 0, 0);
          doc.text(`Total: $${totalUSD.toFixed(2)}`, startX, yPos + 22);
          doc.text(`R$ ${totalBRL.toFixed(2)}`, startX, yPos + 28);
          doc.setFontSize(12);
        };

        // Layout: 2 items per row
        renderCloudPrice("AWS", aws, 14);
        renderCloudPrice("Azure", azure, 100);
        yPos += 40;
        
        renderCloudPrice("Google Cloud Platform", gcp, 14);
        renderCloudPrice("Oracle Cloud", oracle, 100);
        
      } else {
         yPos += 8;
         doc.setFont("helvetica", "normal");
         doc.setFontSize(10);
         doc.setTextColor(secondaryColor);
         doc.text("Pricing data is currently loading or unavailable.", 14, yPos);
      }

      // Footer
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.setTextColor(secondaryColor);
      doc.text("Infralyzer - Cloud Cost Estimation Dashboard", 14, 280);

      doc.save(filename);
    } catch (error) {
      console.error("Failed to generate PDF", error);
      alert("Erro ao gerar PDF: verifique dependências ou console.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <TuiButton onClick={handleExport} loading={isExporting} className="gap-2 flex items-center justify-center max-w-[280px]">
      <Download size={20} className="mr-2" />
      {isExporting ? t('exportPdfLoading') : t('exportPdf')}
    </TuiButton>
  );
}
