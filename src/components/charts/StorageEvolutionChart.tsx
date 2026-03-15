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
  const { t } = useTranslation();

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
    <div className="w-full h-64 bg-card border border-primary/20 p-4 mt-6">
      <h4 className="text-sm font-bold text-primary tracking-widest uppercase mb-4 mb-2">
        {'>'} {t('storageEvolution')}
      </h4>
      <div className="w-full h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorStorage" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
            <XAxis dataKey="month" stroke="hsl(var(--primary))" fontSize={10} tickMargin={10} />
            <YAxis stroke="hsl(var(--primary))" fontSize={10} tickFormatter={(value) => `${value} GB`} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--primary))', color: 'hsl(var(--primary))', fontFamily: 'monospace' }} 
              itemStyle={{ color: 'hsl(var(--primary))', fontWeight: 'bold' }}
              formatter={(value: number) => [`${value} GB`, t('dbStorage')]}
            />
            <Area type="monotone" dataKey="storage" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorStorage)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
