import React, { useState } from 'react';
import { TuiButton } from './TuiButton';
import { Download } from 'lucide-react';
import { useTranslation } from "@/lib/i18n/I18nContext";
import type { BusinessMetrics, InfrastructureProjections } from "@/types";
import { calculateInfrastructure } from "@/lib/core/engine";

interface ExportPDFButtonProps {
  filename?: string;
  metrics: BusinessMetrics;
  scenarios?: BusinessMetrics[];
  projections: InfrastructureProjections;
  pricingData?: any;
}

export function ExportPDFButton({ filename = "infralyze-report.pdf", metrics, scenarios, projections, pricingData }: ExportPDFButtonProps) {
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

      const checkPageBreak = (currentY: number, requiredHeight: number) => {
        if (currentY + requiredHeight > 275) {
          doc.addPage();
          return 20; // reset yPos to top margin
        }
        return currentY;
      };

      const scenarioList = scenarios && scenarios.length > 0 ? scenarios : [metrics];

      // Helper function to draw a simple table
      const drawTable = (title: string, headers: string[], data: string[][], startY: number) => {
        let y = checkPageBreak(startY, 25);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text(title, 14, y);
        
        y += 6;
        const rowHeight = 8;
        const startX = 14;
        const tableWidth = 182;
        const colWidth = tableWidth / headers.length;
        
        // Headers
        doc.setFillColor(240, 240, 240);
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.2);
        doc.rect(startX, y, tableWidth, rowHeight, "FD");
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        let currX = startX + 3;
        headers.forEach((h) => {
           doc.text(h, currX, y + 5);
           currX += colWidth;
        });
        
        y += rowHeight;
        
        // Rows
        doc.setFont("helvetica", "normal");
        data.forEach((row, idx) => {
          let cx = startX + 3;
          let maxLines = 1;
          const rowSplits = row.map((col) => {
            const split = doc.splitTextToSize(col, colWidth - 5);
            if (split.length > maxLines) maxLines = split.length;
            return split;
          });
          
          const actualRowHeight = Math.max(8, (maxLines * 5) + 3);
          y = checkPageBreak(y, actualRowHeight);

          doc.setFillColor(idx % 2 === 0 ? 255 : 249, 255, 255); // Alternating row color
          if (idx % 2 !== 0) doc.setFillColor(250, 250, 250);
          
          doc.rect(startX, y, tableWidth, actualRowHeight, "FD");
          
          rowSplits.forEach((splitContent) => {
            doc.text(splitContent, cx, y + 5);
            cx += colWidth;
          });
          y += actualRowHeight;
        });
        
        return y + 8; // Next Y position
      };

      scenarioList.forEach((scenarioMetrics, index) => {
        let yPos = 40;
        if (index > 0) {
          doc.addPage();
          yPos = 20; // Start new page for each scenario after the first
        }

        // Scenario Title
        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.setTextColor(primaryColor);
        doc.text(`Scenario ${index + 1}: ${(scenarioMetrics as any).name || 'Default'}`, 14, yPos);
        yPos += 10;

        // Section: Business Metrics
        yPos = checkPageBreak(yPos, 60); // Estimate height for this section
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text("Business Metrics (Inputs)", 14, yPos);
        
        yPos += 8;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(textColor);
        const metricsList = [
          `Daily Active Users (DAU): ${scenarioMetrics.DAU.toLocaleString()}`,
          `Requests per User/Day: ${scenarioMetrics.RequestsPerUser}`,
          `Read / Write Ratio: ${scenarioMetrics.ReadRatioPercentage}% / ${scenarioMetrics.WriteRatioPercentage}%`,
          `Avg Write Payload: ${scenarioMetrics.AvgPayloadSizeBytes} Bytes`,
          `Avg Read Response: ${scenarioMetrics.AvgResponseSizeBytes} Bytes`,
          `Database Retention: ${scenarioMetrics.RetentionDays} Days`,
          `Database Replication Factor: ${scenarioMetrics.ReplicationFactor || 3}`
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
        yPos = checkPageBreak(yPos, 60); // Estimate height for this section
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text("Technical Projections", 14, yPos);
        
        yPos += 8;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(11);
        doc.setTextColor(textColor);

        const currentProjections = calculateInfrastructure(scenarioMetrics);
        const normalProjections = calculateInfrastructure({ ...scenarioMetrics, PeakFactor: 1.0 });
        const currentPeakFactor = scenarioMetrics.PeakFactor || 1.0;

        yPos = drawTable("Traffic Projections", ["Metric", "Normal Load (PF: 1.0)", `Peak Load (PF: ${currentPeakFactor}x)`], [
          ["Total QPS (Queries Per Second)", Math.round(normalProjections.peakQPS).toLocaleString(), Math.round(currentProjections.peakQPS).toLocaleString()],
          ["Read QPS (SELECTs)", Math.round(normalProjections.readQPS).toLocaleString(), Math.round(currentProjections.readQPS * currentPeakFactor).toLocaleString()],
          ["Write QPS (MUTATIONs)", Math.round(normalProjections.writeQPS).toLocaleString(), Math.round(currentProjections.writeQPS * currentPeakFactor).toLocaleString()]
        ], yPos);

        yPos = drawTable("Monthly Accumulation", ["Resource Type", "Estimated Volume"], [
          ["Database Storage (Total Required)", `${currentProjections.totalStorageGB.toFixed(2)} GB`],
          ["Monthly Egress (Network Outbound)", `${currentProjections.totalEgressGB.toFixed(2)} GB`]
        ], yPos);

        // Section: Insights
        yPos = checkPageBreak(yPos, 100); // Estimate height for this section
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text("Infralyzer Insights", 14, yPos);
        yPos += 8;

        const addInsightToPDF = (titleKey: string, defaultTitle: string, descKey: string, defaultDesc: string) => {
          // Wrap text to fit PDF width
          const splitDesc = doc.splitTextToSize(t(descKey as any, { defaultValue: defaultDesc }), 180);
          const requiredHeight = (splitDesc.length * 5) + 12;
          yPos = checkPageBreak(yPos, requiredHeight);
          
          doc.setFont("helvetica", "bold");
          doc.setFontSize(11);
          doc.setTextColor(primaryColor);
          doc.text(`> ${t(titleKey as any, { defaultValue: defaultTitle })}`, 14, yPos);
          yPos += 5;
          
          doc.setFont("helvetica", "italic");
          doc.setFontSize(10);
          doc.setTextColor(secondaryColor);
          
          doc.text(splitDesc, 14, yPos);
          yPos += (splitDesc.length * 5) + 3;
        };

        if (currentProjections.peakQPS < 1000) {
          addInsightToPDF("aiStdTitle", "Standard Architecture Profile", "aiStdDesc", "Current metrics suggest a straightforward architecture will comfortably support your traffic.");
        }
        if (scenarioMetrics.ReadRatioPercentage >= 70) {
          addInsightToPDF("aiReadHeavyTitle", "Read-Heavy Workload", "aiReadHeavyDesc", "Your traffic favors queries over mutations. Optimize by employing Database Replication.");
        }
        if (scenarioMetrics.WriteRatioPercentage >= 60) {
          addInsightToPDF("aiWriteHeavyTitle", "Write-Heavy Workload", "aiWriteHeavyDesc", "Your system constantly intakes new data. Employ horizontal Partitioning (Sharding) to split writes.");
        }
        if (scenarioMetrics.ReadRatioPercentage >= 75 && currentProjections.peakQPS > 5000) {
          addInsightToPDF("aiCacheTitle", "High Read-Throughput Detected", "aiCacheDesc", "Consider adding a robust caching layer (Redis / Memcached).");
        }
        if (scenarioMetrics.WriteRatioPercentage >= 50 && currentProjections.totalStorageGB > 2000) {
          addInsightToPDF("aiDbTitle", "Massive Write Stream & Storage", "aiDbDesc", "Your data acts like an append-only log. Consider using specialized databases like ScyllaDB.");
        }
        if (currentProjections.totalEgressGB > 2000) {
          addInsightToPDF("aiCdnTitle", "High Bandwidth Warning", "aiCdnDesc", "Your application is serving massive amounts of outbound traffic. Offload to a CDN.");
        }  

        yPos += 10;
        doc.setDrawColor(200, 200, 200);
        doc.line(14, yPos, 196, yPos);
        yPos += 10;

        // Section: Cloud Pricing
        yPos = checkPageBreak(yPos, 120); // Estimate height for this section
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
            
            const totalUSD = (currentProjections.totalStorageGB * data.storage) + (currentProjections.totalEgressGB * data.egress);
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
      });

      // Footer
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFont("helvetica", "italic");
        doc.setFontSize(9);
        doc.setTextColor(secondaryColor);
        doc.text(`Infralyzer - Cloud Cost Estimation Dashboard | Page ${i} of ${totalPages}`, 14, 285);
      }

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
