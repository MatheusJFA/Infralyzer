"use client";

import React, { useMemo } from 'react';
import { useTranslation } from "@/lib/i18n/I18nContext";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { BusinessMetrics, InfrastructureProjections } from '@/types';
import { calculateMonthlyStorageGB } from '@/lib/core/formulas';
import Decimal from 'decimal.js';

interface StorageEvolutionChartProps {
  metrics: BusinessMetrics;
  projections: InfrastructureProjections;
}

export function StorageEvolutionChart({ metrics, projections }: StorageEvolutionChartProps) {
  const { t, formatNumber, formatDataSize } = useTranslation();

  const data = useMemo(() => {
    const totalMonths = Math.ceil(metrics.RetentionDays / 30);
    const monthsData = [];
    
    const writeQPS = new Decimal(projections.avgQPS).mul(metrics.WriteRatioPercentage / 100);

    for (let m = 1; m <= totalMonths; m++) {
      // Calculate storage for cumulative days
      const days = Math.min(m * 30, metrics.RetentionDays);
      const storageForDays = calculateMonthlyStorageGB(
        writeQPS,
        metrics.AvgPayloadSizeBytes,
        days,
        metrics.ReplicationFactor || 3
      ).toNumber();

      monthsData.push({
        month: `${t('month')} ${m}`,
        storage: Number(storageForDays.toFixed(2))
      });
    }

    return monthsData;
  }, [metrics, projections, t]);

  if (data.length <= 1) return null; // No need to draw a chart for just 1 month

  return (
    <div className="w-full bg-terminal-black border border-terminal-tertiary/20 p-6 relative group hover:border-terminal-primary/40 transition-colors duration-500 mt-6">
      <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-terminal-primary"></div>
      <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-terminal-primary"></div>
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-terminal-primary"></div>
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-terminal-primary"></div>

      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[11px] font-bold tracking-widest uppercase text-terminal-primary drop-shadow-[0_0_5px_rgba(0,255,0,0.8)]">
          {'>'} {t('storageEvolution')}
        </h3>
      </div>
      <div className="border-b border-terminal-tertiary/30 border-dashed w-full block mb-6 -mt-2"></div>
      
      <div className="h-[250px] w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorStorage" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00ff00" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#00ff00" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#00ff00" opacity={0.1} vertical={false} />
            <XAxis dataKey="month" stroke="#00ff00" tick={{ fill: '#00ff00', opacity: 0.8, fontSize: 10, fontFamily: 'monospace' }} axisLine={{ stroke: '#00ff00', opacity: 0.3 }} tickLine={{ stroke: '#00ff00', opacity: 0.3 }} />
            <YAxis stroke="#00ff00" tick={{ fill: '#00ff00', opacity: 0.8, fontSize: 10, fontFamily: 'monospace' }} tickFormatter={(value) => formatDataSize(value)} axisLine={{ stroke: '#00ff00', opacity: 0.3 }} tickLine={{ stroke: '#00ff00', opacity: 0.3 }} />
            <Tooltip 
              cursor={{ stroke: 'rgba(0, 255, 0, 0.2)', strokeWidth: 2 }}
              contentStyle={{ backgroundColor: 'black', border: '1px solid #00ff00', color: '#00ff00', fontFamily: 'monospace', textTransform: 'uppercase', fontSize: '12px' }} 
              itemStyle={{ color: '#00ff00', fontWeight: 'bold' }}
              formatter={(value: number) => [formatDataSize(value), t('dbStorage')]}
            />
            <Area type="monotone" dataKey="storage" stroke="#00ff00" fillOpacity={1} fill="url(#colorStorage)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
