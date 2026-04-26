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
  const { t, formatDataSize } = useTranslation();

  const data = useMemo(() => {
    const totalMonths = Math.ceil(metrics.RetentionDays / 30);
    const monthsData = [];

    const writeQPS = new Decimal(projections.avgQPS).mul(metrics.WriteRatioPercentage / 100);

    for (let m = 1; m <= totalMonths; m++) {
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

  if (data.length <= 1) return null;

  const blueprintBlue = 'hsl(var(--paper-primary))';
  const tooltipBg = 'hsl(var(--card))';
  const tooltipBorder = 'hsl(var(--paper-outline))';

  return (
    <div className="w-full bg-card border border-paper-outline/20 p-6 relative group hover:border-paper-primary/40 transition-colors duration-500 mt-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[11px] font-bold tracking-widest uppercase text-paper-primary">
          {'>'} {t('storageEvolution')}
        </h3>
      </div>
      <div className="border-b border-paper-outline/30 border-dashed w-full block mb-6 -mt-2"></div>

      <div className="h-[250px] w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorStorage" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={blueprintBlue} stopOpacity={0.2} />
                <stop offset="95%" stopColor={blueprintBlue} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={blueprintBlue} opacity={0.1} vertical={false} />
            <XAxis
              dataKey="month"
              stroke={blueprintBlue}
              tick={{ fill: blueprintBlue, opacity: 0.8, fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}
              axisLine={{ stroke: blueprintBlue, opacity: 0.3 }}
              tickLine={{ stroke: blueprintBlue, opacity: 0.3 }}
            />
            <YAxis
              stroke={blueprintBlue}
              tick={{ fill: blueprintBlue, opacity: 0.8, fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}
              tickFormatter={(value) => formatDataSize(value)}
              axisLine={{ stroke: blueprintBlue, opacity: 0.3 }}
              tickLine={{ stroke: blueprintBlue, opacity: 0.3 }}
            />
            <Tooltip
              cursor={{ stroke: blueprintBlue, strokeWidth: 1, strokeDasharray: '3 3' }}
              contentStyle={{
                backgroundColor: tooltipBg,
                border: `1px solid ${tooltipBorder}`,
                color: blueprintBlue,
                fontFamily: "'JetBrains Mono', monospace",
                textTransform: 'uppercase',
                fontSize: '12px'
              }}
              itemStyle={{ color: blueprintBlue, fontWeight: 'bold' }}
              formatter={(value: number) => [formatDataSize(value), t('dbStorage')]}
            />
            <Area type="monotone" dataKey="storage" stroke={blueprintBlue} fillOpacity={1} fill="url(#colorStorage)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
