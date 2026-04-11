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
  const { t, formatNumber, formatDataSize, locale } = useTranslation();
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

      // THEME TOKENS - Architectural Blueprint
      const BLUEPRINT_BLUE = [30, 64, 175]; // #1e40af
      const TEXT_MAIN = [30, 41, 59]; // #1e293b
      const TEXT_SUB = [100, 116, 139]; // #64748b
      const LINE_LIGHT = [226, 232, 240]; // #e2e8f0
      const GRID_COLOR = [241, 245, 249]; // #f1f5f9

      // 1. Draw Architectural Grid Background (Subtle)
      doc.setDrawColor(GRID_COLOR[0], GRID_COLOR[1], GRID_COLOR[2]);
      doc.setLineWidth(0.1);
      for (let i = 0; i < 210; i += 10) doc.line(i, 0, i, 297);
      for (let i = 0; i < 297; i += 10) doc.line(0, i, 210, i);

      // 2. Header Section
      doc.setFont("helvetica", "bold");
      doc.setFontSize(24);
      doc.setTextColor(BLUEPRINT_BLUE[0], BLUEPRINT_BLUE[1], BLUEPRINT_BLUE[2]);
      doc.text("> INFRALYZER REPORT", 14, 20);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(TEXT_SUB[0], TEXT_SUB[1], TEXT_SUB[2]);
      const dateStr = new Date().toLocaleString(locale === 'pt' ? 'pt-BR' : 'en-US');
      doc.text(`SYSTEM_SPEC_GEN_TIMESTAMP: ${dateStr}`, 14, 26);

      // Top Highlight Line (Blue, not Green)
      doc.setDrawColor(BLUEPRINT_BLUE[0], BLUEPRINT_BLUE[1], BLUEPRINT_BLUE[2]);
      doc.setLineWidth(0.8);
      doc.line(14, 30, 196, 30);

      const checkPageBreak = (currentY: number, requiredHeight: number) => {
        if (currentY + requiredHeight > 275) {
          doc.addPage();
          // Redraw grid on new page
          doc.setDrawColor(GRID_COLOR[0], GRID_COLOR[1], GRID_COLOR[2]);
          doc.setLineWidth(0.1);
          for (let i = 0; i < 210; i += 10) doc.line(i, 0, i, 297);
          for (let i = 0; i < 297; i += 10) doc.line(0, i, 210, i);
          return 20;
        }
        return currentY;
      };

      const scenarioList = scenarios && scenarios.length > 0 ? scenarios : [metrics];

      const drawTable = (title: string, headers: string[], data: string[][], startY: number) => {
        let y = checkPageBreak(startY, 30);
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(BLUEPRINT_BLUE[0], BLUEPRINT_BLUE[1], BLUEPRINT_BLUE[2]);
        doc.text(`[ ${title.toUpperCase()} ]`, 14, y);
        
        y += 6;
        const rowHeight = 7;
        const startX = 14;
        const tableWidth = 182;
        const colWidth = tableWidth / headers.length;
        
        // Table Header
        doc.setFillColor(BLUEPRINT_BLUE[0], BLUEPRINT_BLUE[1], BLUEPRINT_BLUE[2]);
        doc.rect(startX, y, tableWidth, rowHeight, "F");
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.setTextColor(255, 255, 255);
        let currX = startX + 3;
        headers.forEach((h) => {
          doc.text(h.toUpperCase(), currX, y + 4.5);
          currX += colWidth;
        });
        
        y += rowHeight;
        
        // Table Content
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        data.forEach((row, idx) => {
          let cx = startX + 3;
          let maxLines = 1;
          const rowSplits = row.map((col) => {
            const split = doc.splitTextToSize(col, colWidth - 5);
            if (split.length > maxLines) maxLines = split.length;
            return split;
          });
          
          const actualRowHeight = Math.max(7, (maxLines * 4.5) + 2);
          y = checkPageBreak(y, actualRowHeight);

          // Alternating rows
          doc.setFillColor(idx % 2 === 0 ? 255 : 250, 251, idx % 2 === 0 ? 255 : 253);
          doc.setDrawColor(LINE_LIGHT[0], LINE_LIGHT[1], LINE_LIGHT[2]);
          doc.rect(startX, y, tableWidth, actualRowHeight, "FD");
          
          doc.setTextColor(TEXT_MAIN[0], TEXT_MAIN[1], TEXT_MAIN[2]);
          rowSplits.forEach((splitContent) => {
            doc.text(splitContent, cx, y + 4.5);
            cx += colWidth;
          });
          y += actualRowHeight;
        });
        
        return y + 10;
      };

      scenarioList.forEach((scenarioMetrics, index) => {
        let yPos = 40;
        if (index > 0) {
          yPos = checkPageBreak(yPos, 297); // Force new page
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.setTextColor(BLUEPRINT_BLUE[0], BLUEPRINT_BLUE[1], BLUEPRINT_BLUE[2]);
        doc.text(`DRAFT_SCENARIO_0${index + 1}: ${(scenarioMetrics as any).name || 'SYSTEM_DEFAULT'}`, 14, yPos);
        yPos += 12;

        // SECTION: INPUTS
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(TEXT_MAIN[0], TEXT_MAIN[1], TEXT_MAIN[2]);
        doc.text("ENGINE_INPUT_METRICS", 14, yPos);
        yPos += 6;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(TEXT_SUB[0], TEXT_SUB[1], TEXT_SUB[2]);
        
        const metricsList = [
          `DAU: ${formatNumber(scenarioMetrics.DAU)}`,
          `RPS/USER: ${formatNumber(scenarioMetrics.RequestsPerUser)}`,
          `R/W_RATIO: ${scenarioMetrics.ReadRatioPercentage}% / ${scenarioMetrics.WriteRatioPercentage}%`,
          `PAYLOAD_SIZE: ${formatNumber(scenarioMetrics.AvgPayloadSizeBytes)} B`,
          `RETENTION_VAL: ${scenarioMetrics.RetentionDays} DAYS`
        ];

        metricsList.forEach(item => {
          doc.text(`- ${item}`, 14, yPos);
          yPos += 5;
        });

        yPos += 5;
        doc.setDrawColor(BLUEPRINT_BLUE[0], BLUEPRINT_BLUE[1], BLUEPRINT_BLUE[2]);
        doc.setLineWidth(0.2);
        doc.line(14, yPos, 40, yPos);
        yPos += 10;

        // SECTION: PROJECTIONS
        const cp = calculateInfrastructure(scenarioMetrics);
        const np = calculateInfrastructure({ ...scenarioMetrics, PeakFactor: 1.0 });
        const pf = scenarioMetrics.PeakFactor || 1.0;

        yPos = drawTable("Traffic Projection Analysis", ["Metric Item", "Standard Load", `Peak Load (${pf}x)`], [
          ["Query Throughput (Total QPS)", formatNumber(np.peakQPS, { minimumFractionDigits: 1, maximumFractionDigits: 2 }), formatNumber(cp.peakQPS, { minimumFractionDigits: 1, maximumFractionDigits: 2 })],
          ["Read Traffic (SELECT)", formatNumber(np.readQPS, { minimumFractionDigits: 1, maximumFractionDigits: 1 }), formatNumber(cp.readQPS * pf, { minimumFractionDigits: 1, maximumFractionDigits: 1 })],
          ["Write Traffic (UPSERT)", formatNumber(np.writeQPS, { minimumFractionDigits: 1, maximumFractionDigits: 1 }), formatNumber(cp.writeQPS * pf, { minimumFractionDigits: 1, maximumFractionDigits: 1 })]
        ], yPos);

        yPos = drawTable("Capacity Requirements", ["Asset Type", "Calculated Volume"], [
          ["Total DB Storage Required", formatDataSize(cp.totalStorageGB)],
          ["Estimated Network Egress", formatDataSize(cp.totalEgressGB)]
        ], yPos);

        // SECTION: COST ESTIMATION
        if (pricingData) {
          const { aws, azure, gcp, oracle, exchangeRate } = pricingData;
          yPos = checkPageBreak(yPos, 50);
          
          doc.setFont("helvetica", "bold");
          doc.setFontSize(11);
          doc.setTextColor(BLUEPRINT_BLUE[0], BLUEPRINT_BLUE[1], BLUEPRINT_BLUE[2]);
          doc.text("FINANCIAL_COST_PROJECTION (USD/BRL)", 14, yPos);
          yPos += 8;

          const renderPriceRow = (label: string, data: any, x: number) => {
            doc.setFont("helvetica", "bold"); doc.setFontSize(10);
            doc.setTextColor(TEXT_MAIN[0], TEXT_MAIN[1], TEXT_MAIN[2]);
            doc.text(label, x, yPos);
            
            const totalUSD = (cp.totalStorageGB * data.storage) + (cp.totalEgressGB * data.egress);
            doc.setFont("helvetica", "normal"); doc.setFontSize(9);
            doc.setTextColor(BLUEPRINT_BLUE[0], BLUEPRINT_BLUE[1], BLUEPRINT_BLUE[2]);
            doc.text(`$ ${formatNumber(totalUSD, { minimumFractionDigits: 2 })} /MO`, x, yPos + 5);
          };

          renderPriceRow("AWS_INFRA", aws, 14);
          renderPriceRow("GCP_INFRA", gcp, 60);
          renderPriceRow("AZURE_INFRA", azure, 106);
          renderPriceRow("ORACLE_INFRA", oracle, 152);
          yPos += 15;
        }
      });

      // Footer
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
        doc.setTextColor(TEXT_SUB[0], TEXT_SUB[1], TEXT_SUB[2]);
        doc.text(`[ INFRALYZER_ARCH_BLUEPRINT_V1.0 | PAGE_0${i} | CONFIDENTIAL_INTERNAL ]`, 14, 288);
      }

      doc.save(filename);
    } catch (error) {
      console.error("Failed to generate PDF", error);
      alert("Error generating technical PDF report.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <TuiButton onClick={handleExport} loading={isExporting} className="gap-3 flex items-center justify-center min-w-[200px] border border-paper-primary/20">
      <Download size={18} />
      <span>{isExporting ? t('exportPdfLoading').toUpperCase() : t('exportPdf').toUpperCase()}</span>
    </TuiButton>
  );
}
