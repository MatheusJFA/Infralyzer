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
  const { formatNumber } = useTranslation();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onValueChange(name, parseFloat(e.target.value) || 0);
  };

  return (
    <TuiFormGroup className="mb-6 pb-6 border-b border-terminal-tertiary/30 border-dashed last:border-0 last:pb-0">
      <div className="flex flex-col justify-between items-start gap-3 mb-4">
        <label className="text-[11px] text-muted-foreground tracking-widest flex items-center uppercase" htmlFor={name}>
          <span className="break-words mr-2">{label}</span>
          {infoText && <InfoTooltip content={infoText} />}
        </label>
        <div className="flex items-center gap-2 shrink-0 self-start max-w-full">
          {editable ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onValueChange(name, Math.max(min, value - (step || 1)))}
                className="h-10 w-10 flex items-center justify-center rounded-none bg-terminal-secondary border border-terminal-tertiary hover:bg-terminal-primary hover:text-terminal-black transition-all active:scale-95"
              >
                <Minus className="h-4 w-4" />
              </button>
              <input
                type="number"
                name={name}
                value={value || ""}
                onChange={handleChange}
                className="w-36 text-center text-xl font-bold bg-terminal-neutral text-terminal-primary px-2 py-1 rounded-none shadow-none border border-terminal-tertiary hover:border-terminal-primary focus:border-terminal-primary focus:outline-none focus:ring-1 focus:ring-terminal-primary drop-shadow-[0_0_5px_rgba(0,255,0,0.5)] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [appearance:textfield]"
              />
              <button
                type="button"
                onClick={() => onValueChange(name, Math.min(max, value + (step || 1)))}
                className="h-10 w-10 flex items-center justify-center rounded-none bg-terminal-secondary border border-terminal-tertiary hover:bg-terminal-primary hover:text-terminal-black transition-all active:scale-95"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="text-xl font-bold bg-terminal-neutral text-terminal-primary border border-terminal-tertiary px-3 py-1 rounded-none shadow-none drop-shadow-[0_0_5px_rgba(0,255,0,0.5)]">
              {formatNumber(value)}
            </div>
          )}
          {suffix && <span className="text-[10px] text-muted-foreground font-bold uppercase whitespace-nowrap tracking-widest">{suffix}</span>}
        </div>
      </div>
      
      <div className="relative h-8 flex items-center mt-2">
        <div className="absolute left-0 right-0 h-1 bg-terminal-tertiary top-1/2 -translate-y-1/2">
           <div className="h-full bg-terminal-primary drop-shadow-[0_0_5px_rgba(0,255,0,0.8)]" style={{ width: `${Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100))}%` }}></div>
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
          className="absolute w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div 
          className="absolute w-2 h-6 bg-terminal-primary border border-terminal-black pointer-events-none drop-shadow-[0_0_8px_rgba(0,255,0,0.8)] top-1/2 -translate-y-1/2 transform -translate-x-1/2 transition-all duration-75"
          style={{ left: `${Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100))}%` }}
        ></div>
      </div>

      {presets.length > 0 && (
        <div className="grid grid-cols-5 gap-1 mt-4">
          {presets.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => onValueChange(name, preset.value)}
              className={`text-[10px] py-2 border transition-colors flex items-center justify-center ${
                value === preset.value
                  ? 'bg-terminal-primary text-terminal-black border-terminal-primary drop-shadow-[0_0_5px_rgba(0,255,0,0.4)]' 
                  : 'bg-transparent text-muted-foreground border-terminal-tertiary hover:border-terminal-primary/50'
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
        max={100000000}
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
          { label: "10M", value: 10000000 },
          { label: "50M", value: 50000000 },
          { label: "100M", value: 100000000 },
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
          max={10485760}
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
