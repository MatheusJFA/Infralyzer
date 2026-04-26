"use client"

import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { useTranslation } from "@/lib/i18n/I18nContext";
import { InfoTooltip } from "@/components/InfoTooltip";
import type { BusinessMetrics } from '@/types';
import { TuiFormGroup } from "@/components/ui/TuiFormGroup";

interface MetricsFormProps {
  metrics: BusinessMetrics;
  onChange: (metrics: BusinessMetrics) => void;
}

interface Preset {
  label: string;
  value: number;
}

interface MetricSliderProps {
  label: string;
  name: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onValueChange: (name: string, value: number) => void;
  suffix?: string;
  editable?: boolean;
  presets?: Preset[];
  infoText?: string;
  scale?: 'linear' | 'log';
}

export function MetricSlider({
  label,
  name,
  value,
  min,
  max,
  step = 1,
  onValueChange,
  suffix = "",
  editable = false,
  presets = [],
  infoText,
  scale = 'linear',
}: MetricSliderProps) {
  const { formatNumber } = useTranslation();

  // Logarithmic conversion helpers
  const toLog = (val: number) => {
    const safeMin = min === 0 ? 0.1 : min;
    const safeVal = Math.max(safeMin, val);
    if (safeVal <= safeMin) return 0;
    if (safeVal >= max) return 100;
    return (100 * Math.log(safeVal / safeMin)) / Math.log(max / safeMin);
  };

  const fromLog = (logVal: number) => {
    const safeMin = min === 0 ? 0.1 : min;
    let val = safeMin * Math.pow(max / safeMin, logVal / 100);

    // If the original min was 0 and we are very close to our safeMin, snap to 0
    if (min === 0 && logVal < 5) {
      const snapToZeroThreshold = safeMin * 1.5;
      if (val < snapToZeroThreshold) val = 0;
    }

    if (step >= 1) return Math.round(val / step) * step;
    return parseFloat(val.toFixed(2));
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = parseFloat(e.target.value);
    if (scale === 'log') {
      onValueChange(name, fromLog(rawVal));
    } else {
      onValueChange(name, rawVal);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onValueChange(name, parseFloat(e.target.value) || 0);
  };

  // UI Values
  const sliderMin = scale === 'log' ? 1 : min;
  const sliderMax = scale === 'log' ? 100 : max;
  const sliderStep = scale === 'log' ? 0.01 : step;
  const sliderValue = scale === 'log' ? toLog(value) : value;
  const progressPercent = scale === 'log' ? sliderValue : ((value - min) / (max - min)) * 100;

  return (
    <TuiFormGroup className="mb-6 pb-6 border-b border-paper-outline/30 border-dashed last:border-0 last:pb-0">
      <div className="flex flex-col justify-between items-start gap-3 mb-4">
        <label className="text-[11px] text-muted-foreground tracking-wider flex items-center uppercase" htmlFor={name}>
          <span className="break-words mr-2">{label}</span>
          {infoText && <InfoTooltip content={infoText} />}
        </label>
        <div className="flex flex-wrap items-center gap-1.5 self-start max-w-full">
          {editable ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={value <= min}
                onClick={() => {
                  const nextVal = scale === 'log' ? fromLog(toLog(value) - 5) : value - step;
                  onValueChange(name, Math.max(min, nextVal));
                }}
                className={`h-10 w-10 flex items-center justify-center border transition-all active:scale-95 ${value <= min
                  ? 'bg-paper-secondary/50 border-paper-outline/30 text-paper-outline cursor-not-allowed opacity-50'
                  : 'bg-paper-secondary border-paper-outline hover:bg-paper-primary hover:text-card text-paper-primary cursor-pointer'
                  }`}
              >
                <Minus className="h-4 w-4" />
              </button>
              <input
                type="number"
                name={name}
                value={value ?? ""}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (!isNaN(val)) {
                    onValueChange(name, Math.max(min, Math.min(max, val)));
                  }
                }}
                className="w-28 text-center text-xl font-bold bg-card/40 backdrop-blur-sm text-paper-primary px-1 py-1 shadow-none border border-paper-outline/30 hover:border-paper-primary/50 focus:border-paper-primary focus:outline-none focus:ring-1 focus:ring-paper-primary [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [appearance:textfield] transition-all"
              />
              <button
                type="button"
                disabled={value >= max}
                onClick={() => {
                  const nextVal = scale === 'log' ? fromLog(toLog(value) + 5) : value + step;
                  onValueChange(name, Math.min(max, nextVal));
                }}
                className={`h-10 w-10 flex items-center justify-center border transition-all active:scale-95 ${value >= max
                  ? 'bg-paper-secondary/50 border-paper-outline/30 text-paper-outline cursor-not-allowed opacity-50'
                  : 'bg-paper-secondary border-paper-outline hover:bg-paper-primary hover:text-card text-paper-primary cursor-pointer'
                  }`}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="text-xl font-bold bg-card/40 backdrop-blur-sm text-paper-primary border border-paper-outline/30 px-3 py-1 rounded-none shadow-none ">
              {formatNumber(value)}
            </div>
          )}
          {suffix && <span className="text-[10px] text-muted-foreground font-bold uppercase whitespace-nowrap tracking-wider">{suffix}</span>}
        </div>
      </div>

      <div className="relative h-8 flex items-center mt-2">
        <div className="absolute left-0 right-0 h-1 bg-paper-outline top-1/2 -translate-y-1/2">
          <div
            className="h-full bg-paper-primary transition-all duration-75"
            style={{ width: `${Math.max(0, Math.min(100, progressPercent))}%` }}
          ></div>
        </div>
        <input
          id={name}
          name={name}
          type="range"
          min={sliderMin}
          max={sliderMax}
          step={sliderStep}
          value={sliderValue}
          onChange={handleSliderChange}
          className="absolute w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div
          className="absolute w-2 h-6 bg-paper-primary border border-card pointer-events-none top-1/2 -translate-y-1/2 transform -translate-x-1/2 transition-all duration-75"
          style={{ left: `${Math.max(0, Math.min(100, progressPercent))}%` }}
        ></div>
      </div>

      {presets.length > 0 && (
        <div className="grid grid-cols-5 gap-1 mt-4">
          {presets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => onValueChange(name, preset.value)}
              className={`text-[10px] py-2 border transition-colors flex items-center justify-center ${value === preset.value
                ? 'bg-paper-primary text-card border-paper-primary '
                : 'bg-transparent text-muted-foreground border-paper-outline hover:border-paper-primary/50'
                }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}
    </TuiFormGroup>
  );
}

export function MetricsForm({ metrics, onChange }: MetricsFormProps) {
  const { t } = useTranslation();

  const handleValueChange = (name: string, value: number) => {
    // Special logic for connecting Read and Write ratio (Sum = 100%)
    if (name === "ReadRatioPercentage") {
      onChange({
        ...metrics,
        ReadRatioPercentage: value,
        WriteRatioPercentage: 100 - value,
      });
      return;
    }

    onChange({
      ...metrics,
      [name]: value,
    });
  };

  return (
    <div className="space-y-4">
      <MetricSlider
        label={t('DAU')}
        name="DAU"
        value={metrics.DAU}
        min={100}
        max={10_000_000}
        step={100}
        onValueChange={handleValueChange}
        suffix={t('users')}
        infoText={t('descDAU')}
        editable
        scale="linear"
        presets={[
          { label: "100", value: 100 },
          { label: "500", value: 500 },
          { label: "1k", value: 1000 },
          { label: "10k", value: 10000 },
          { label: "100k", value: 100000 },
          { label: "500k", value: 500000 },
          { label: "1M", value: 1000000 },
          { label: "5M", value: 5000000 },
          { label: "10M", value: 10000000 }
        ]}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <MetricSlider
          label={t('RequestsPerUser')}
          name="RequestsPerUser"
          value={metrics.RequestsPerUser}
          min={1}
          max={10000}
          step={5}
          onValueChange={handleValueChange}
          suffix={t('reqs')}
          infoText={t('descRequests')}
          editable
          scale="log"
          presets={[
            { label: "1", value: 1 },
            { label: "10", value: 10 },
            { label: "50", value: 50 },
            { label: "150", value: 150 },
            { label: "500", value: 500 },
            { label: "1000", value: 1000 },
            { label: "5000", value: 5000 },
            { label: "10000", value: 10000 },
          ]}
        />

        <MetricSlider
          label={t('PeakFactor')}
          name="PeakFactor"
          value={metrics.PeakFactor ?? 2.0}
          min={1.0}
          max={20.0}
          step={0.1}
          onValueChange={handleValueChange}
          infoText={t('descPeak')}
          suffix="x"
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        <MetricSlider
          label={t('ReadWriteRatio', { read: metrics.ReadRatioPercentage, write: metrics.WriteRatioPercentage })}
          name="ReadRatioPercentage"
          value={metrics.ReadRatioPercentage}
          min={0}
          max={100}
          step={5}
          onValueChange={handleValueChange}
          infoText={t('descRatio')}
          suffix="% Reads"
          editable
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <MetricSlider
          label={t('AvgPayloadSizeBytes')}
          name="AvgPayloadSizeBytes"
          value={metrics.AvgPayloadSizeBytes}
          min={10}
          max={10485760}
          step={10}
          onValueChange={handleValueChange}
          suffix={t('bytes')}
          infoText={t('descPayload')}
          editable
          scale="log"
          presets={[
            { label: "100B", value: 100 },
            { label: "1KB", value: 1024 },
            { label: "10KB", value: 10240 },
            { label: "50KB", value: 51200 },
            { label: "250KB", value: 256000 },
            { label: "1MB", value: 1048576 },
            { label: "5MB", value: 5242880 },
            { label: "10MB", value: 10485760 },
          ]}
        />

        <MetricSlider
          label={t('AvgResponseSizeBytes')}
          name="AvgResponseSizeBytes"
          value={metrics.AvgResponseSizeBytes}
          min={100}
          max={10485760}
          step={100}
          onValueChange={handleValueChange}
          suffix={t('bytes')}
          infoText={t('descResponse')}
          editable
          scale="log"
          presets={[
            { label: "100B", value: 100 },
            { label: "1KB", value: 1024 },
            { label: "10KB", value: 10240 },
            { label: "50KB", value: 51200 },
            { label: "250KB", value: 256000 },
            { label: "1MB", value: 1048576 },
            { label: "5MB", value: 5242880 },
            { label: "10MB", value: 10485760 },
          ]}
        />

        <MetricSlider
          label={t('RetentionDays')}
          name="RetentionDays"
          value={metrics.RetentionDays}
          min={1}
          max={3650} // Up to 10 years
          step={5}
          onValueChange={handleValueChange}
          suffix={t('days')}
          infoText={t('descRetention')}
          presets={[
            { label: "1 Mo", value: 30 },
            { label: "6 Mo", value: 180 },
            { label: "1 Yr", value: 365 },
            { label: "5 Yr", value: 1825 },
            { label: "10 Yr", value: 3650 },
          ]}
        />

        <MetricSlider
          label={t('ReplicationFactor')}
          name="ReplicationFactor"
          value={metrics.ReplicationFactor ?? 3}
          min={1}
          max={10}
          step={1}
          onValueChange={handleValueChange}
          infoText={t('descReplication')}
          suffix={t('nodes')}
        />
      </div>
    </div>
  );
}
