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
}: {
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
}) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onValueChange(name, parseFloat(e.target.value) || 0);
  };

  return (
    <TuiFormGroup>
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 xl:gap-2">
        <label className="text-sm font-semibold text-foreground tracking-tight flex items-center xl:max-w-[50%]" htmlFor={name}>
          <span className="break-words">{label}</span>
          {infoText && <InfoTooltip content={infoText} />}
        </label>
        <div className="flex items-center gap-2 shrink-0 self-start xl:self-auto">
          {editable ? (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onValueChange(name, Math.max(min, value - (step || 1)))}
                className="h-7 w-7 flex items-center justify-center rounded-none border border-primary/50 bg-black hover:bg-primary/20 text-primary transition-colors focus:outline-none focus:ring-1 focus:ring-primary shrink-0"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <input
                type="number"
                name={name}
                value={value || ""}
                onChange={handleChange}
                className="w-20 text-center text-sm font-bold bg-black text-primary px-2 py-1 rounded-none shadow-none border border-primary/50 hover:border-primary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [appearance:textfield]"
              />
              <button
                type="button"
                onClick={() => onValueChange(name, Math.min(max, value + (step || 1)))}
                className="h-7 w-7 flex items-center justify-center rounded-none border border-primary/50 bg-black hover:bg-primary/20 text-primary transition-colors focus:outline-none focus:ring-1 focus:ring-primary shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="text-sm font-bold bg-black text-primary border border-primary/50 px-3 py-1 rounded-none shadow-none">
              {value.toLocaleString()}
            </div>
          )}
          {suffix && <span className="text-xs text-primary font-bold uppercase whitespace-nowrap tracking-widest">{suffix}</span>}
        </div>
      </div>
      <input
        id={name}
        name={name}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        className="w-full h-2 appearance-none cursor-pointer bg-secondary/50 outline-none hover:bg-secondary transition-all [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-none [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:rounded-none"
      />
      {presets.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {presets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => onValueChange(name, preset.value)}
              className="px-2.5 py-1 text-xs font-bold tracking-wider rounded-none border border-primary/50 bg-black hover:bg-primary/20 hover:border-primary text-primary transition-colors focus:outline-none focus:ring-1 focus:ring-primary"
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
    // Lógica especial para conectar o Read e Write ratio (Soma = 100%)
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
        min={1000}
        max={5000000}
        step={5000}
        onValueChange={handleValueChange}
        suffix={t('users')}
        infoText={t('descDAU')}
        editable
        presets={[
          { label: "10k", value: 10000 },
          { label: "100k", value: 100000 },
          { label: "500k", value: 500000 },
          { label: "1M", value: 1000000 },
          { label: "5M", value: 5000000 },
        ]}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <MetricSlider
          label={t('RequestsPerUser')}
          name="RequestsPerUser"
          value={metrics.RequestsPerUser}
          min={1}
          max={1000}
          step={5}
          onValueChange={handleValueChange}
          suffix={t('reqs')}
          infoText={t('descRequests')}
          editable
          presets={[
            { label: "1", value: 1 },
            { label: "10", value: 10 },
            { label: "50", value: 50 },
            { label: "150", value: 150 },
            { label: "500", value: 500 },
            { label: "1000", value: 1000 }
          ]}
        />

        <MetricSlider
          label={t('PeakFactor')}
          name="PeakFactor"
          value={metrics.PeakFactor ?? 2.0}
          min={1.0}
          max={5.0}
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
          max={1000000}
          step={10}
          onValueChange={handleValueChange}
          suffix={t('bytes')}
          infoText={t('descPayload')}
          editable
          presets={[
            { label: "100B", value: 100 },
            { label: "1KB", value: 1024 },
            { label: "10KB", value: 10240 },
            { label: "50KB", value: 51200 },
            { label: "250KB", value: 256000 },
            { label: "1MB", value: 1048576 },
          ]}
        />

        <MetricSlider
          label={t('AvgResponseSizeBytes')}
          name="AvgResponseSizeBytes"
          value={metrics.AvgResponseSizeBytes}
          min={100}
          max={1000000}
          step={100}
          onValueChange={handleValueChange}
          suffix={t('bytes')}
          infoText={t('descResponse')}
          editable
          presets={[
            { label: "100B", value: 100 },
            { label: "1KB", value: 1024 },
            { label: "10KB", value: 10240 },
            { label: "50KB", value: 51200 },
            { label: "250KB", value: 256000 },
            { label: "1MB", value: 1048576 },
          ]}
        />

        <MetricSlider
          label={t('RetentionDays')}
          name="RetentionDays"
          value={metrics.RetentionDays}
          min={1}
          max={3650} // Até 10 anos
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
          max={5}
          step={1}
          onValueChange={handleValueChange}
          infoText={t('descReplication')}
          suffix={t('nodes')}
        />
      </div>
    </div>
  );
}
