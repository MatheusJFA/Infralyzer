import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useTranslation } from "@/lib/i18n/I18nContext";
import type { BusinessMetrics, InfrastructureProjections } from '@/types';
import { calculateInfrastructure } from '@/lib/core/engine';

interface PeakComparisonChartProps {
  metrics: BusinessMetrics;
  projections: InfrastructureProjections;
}

export function PeakComparisonChart({ metrics, projections }: PeakComparisonChartProps) {
  const { t } = useTranslation();

  const normalMetrics = { ...metrics, PeakFactor: 1.0 };
  const normalProjections = calculateInfrastructure(normalMetrics);

  const data = [
    {
      name: t('avgQPS', { defaultValue: 'Avg QPS' }),
      Normal: normalProjections.avgQPS,
      Peak: projections.peakQPS
    },
    {
      name: t('readQPS', { defaultValue: 'Read QPS' }),
      Normal: normalProjections.readQPS,
      Peak: projections.readQPS * (metrics.PeakFactor || 1.0)
    },
    {
      name: t('writeQPS', { defaultValue: 'Write QPS' }),
      Normal: normalProjections.writeQPS,
      Peak: projections.writeQPS * (metrics.PeakFactor || 1.0)
    }
  ];

  if ((metrics.PeakFactor || 1.0) <= 1.0) {
    return null;
  }

  const blueprintBlue = '#1e40af'; // Blueprint Blue
  const lightBlueprintBlue = '#2768c2ff';

  return (
    <div className="w-full bg-card border border-paper-outline/20 p-6 relative group hover:border-paper-primary/40 transition-colors duration-500 mt-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[11px] font-bold tracking-widest uppercase text-paper-primary">
          {'>'} Peak vs Normal Traffic ({metrics.PeakFactor || 1.0}x Factor)
        </h3>
      </div>
      <div className="border-b border-paper-outline/30 border-dashed w-full block mb-6 -mt-2"></div>
      
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
            barGap={4}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={blueprintBlue} opacity={0.1} vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke={blueprintBlue} 
              tick={{ fill: blueprintBlue, opacity: 0.8, fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }} 
              axisLine={{ stroke: blueprintBlue, opacity: 0.3 }}
              tickLine={{ stroke: blueprintBlue, opacity: 0.3 }}
            />
            <YAxis 
              stroke={blueprintBlue} 
              tick={{ fill: blueprintBlue, opacity: 0.8, fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }} 
              axisLine={{ stroke: blueprintBlue, opacity: 0.3 }}
              tickLine={{ stroke: blueprintBlue, opacity: 0.3 }}
              tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
            />
            <Tooltip 
              cursor={{ fill: 'rgba(30, 64, 175, 0.05)' }}
              contentStyle={{ 
                backgroundColor: '#ffffff', 
                border: `1px solid ${blueprintBlue}`,
                color: blueprintBlue,
                fontSize: '12px',
                fontFamily: "'JetBrains Mono', monospace",
                textTransform: 'uppercase'
              }}
              itemStyle={{ color: blueprintBlue }}
              formatter={(value: number) => Math.round(value).toLocaleString()}
            />
            <Legend 
              wrapperStyle={{ fontSize: '10px', fontFamily: "'JetBrains Mono', monospace", color: blueprintBlue }} 
              iconType="square"
            />
            <Bar dataKey="Normal" name="Normal (PF 1.0)" fill={lightBlueprintBlue} stroke={blueprintBlue} strokeOpacity={0.5} />
            <Bar dataKey="Peak" name={`Peak (PF ${metrics.PeakFactor || 1.0})`} fill={blueprintBlue} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
