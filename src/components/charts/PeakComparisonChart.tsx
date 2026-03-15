import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
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
      Peak: projections.readQPS * (metrics.PeakFactor || 1.0) // Approximate peak read
    },
    {
      name: t('writeQPS', { defaultValue: 'Write QPS' }),
      Normal: normalProjections.writeQPS,
      Peak: projections.writeQPS * (metrics.PeakFactor || 1.0) // Approximate peak write
    }
  ];

  if ((metrics.PeakFactor || 1.0) <= 1.0) {
    return null; // No difference to show
  }

  return (
    <div className="w-full bg-black border border-primary/30 p-4 relative scanlines group hover:border-primary transition-colors duration-500">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 border-b border-primary/20 pb-2">
        <h3 className="text-sm font-bold tracking-widest uppercase text-primary">
          {'>'} Peak vs Normal Traffic ({metrics.PeakFactor || 1.0}x Factor)
        </h3>
      </div>
      
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
            barGap={4}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#00ff00" opacity={0.1} vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke="#00ff00" 
              tick={{ fill: '#00ff00', opacity: 0.8, fontSize: 10, fontFamily: 'monospace' }} 
              axisLine={{ stroke: '#00ff00', opacity: 0.3 }}
              tickLine={{ stroke: '#00ff00', opacity: 0.3 }}
            />
            <YAxis 
              stroke="#00ff00" 
              tick={{ fill: '#00ff00', opacity: 0.8, fontSize: 10, fontFamily: 'monospace' }} 
              axisLine={{ stroke: '#00ff00', opacity: 0.3 }}
              tickLine={{ stroke: '#00ff00', opacity: 0.3 }}
              tickFormatter={(val) => val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
            />
            <Tooltip 
              cursor={{ fill: 'rgba(0, 255, 0, 0.05)' }}
              contentStyle={{ 
                backgroundColor: 'black', 
                border: '1px solid #00ff00',
                color: '#00ff00',
                fontSize: '12px',
                fontFamily: 'monospace',
                textTransform: 'uppercase'
              }}
              itemStyle={{ color: '#00ff00' }}
              formatter={(value: number) => Math.round(value).toLocaleString()}
            />
            <Legend 
              wrapperStyle={{ fontSize: '10px', fontFamily: 'monospace', color: '#00ff00' }} 
              iconType="square"
            />
            <Bar dataKey="Normal" name="Normal (PF 1.0)" fill="#00ff00" fillOpacity={0.3} stroke="#00ff00" />
            <Bar dataKey="Peak" name={`Peak (PF ${metrics.PeakFactor || 1.0})`} fill="#00ff00" fillOpacity={0.9} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
