import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MetricsForm } from '../MetricsForm';

// Mock I18nContext
vi.mock('@/lib/i18n/I18nContext', () => ({
  useTranslation: () => ({
    t: (key: string, params?: any) => {
      if (key === 'ReadWriteRatio') return `Read: ${params.read}, Write: ${params.write}`;
      return key;
    },
    formatNumber: (num: number, options?: any) => {
      const minDecimals = options?.minimumFractionDigits !== undefined ? options.minimumFractionDigits : 0;
      return num.toFixed(Math.max(minDecimals, 0));
    },
    formatDataSize: (gb: number) => `${gb} GB`,
    getStorageDetails: (gb: number) => `${gb} GB detail`,
  }),
}));

// Mock InfoTooltip
vi.mock('@/components/InfoTooltip', () => ({
  InfoTooltip: () => <div data-testid="tooltip" />,
}));

describe('MetricsForm Component', () => {
  const mockMetrics = {
    DAU: 10000,
    RequestsPerUser: 10,
    PeakFactor: 2.0,
    ReadRatioPercentage: 80,
    WriteRatioPercentage: 20,
    AvgPayloadSizeBytes: 1024,
    AvgResponseSizeBytes: 2048,
    RetentionDays: 30,
    ReplicationFactor: 3,
  };

  const onChange = vi.fn();

  it('should render all metric sliders', () => {
    render(<MetricsForm metrics={mockMetrics} onChange={onChange} />);

    expect(screen.getByText('DAU')).toBeInTheDocument();
    expect(screen.getByText('RequestsPerUser')).toBeInTheDocument();
    expect(screen.getByText('Read: 80, Write: 20')).toBeInTheDocument();
  });

  it('should call onChange when a slider value is changed', () => {
    render(<MetricsForm metrics={mockMetrics} onChange={onChange} />);

    // Find DAU slider (input type="range")
    const dauSlider = screen.getAllByRole('slider').find(s => (s as HTMLInputElement).name === 'DAU');
    if (!dauSlider) throw new Error('DAU slider not found');

    fireEvent.change(dauSlider, { target: { value: '20000' } });

    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({
      DAU: 20000
    }));
  });

  it('should update Write ratio when Read ratio changes', () => {
    render(<MetricsForm metrics={mockMetrics} onChange={onChange} />);

    const readSlider = screen.getAllByRole('slider').find(s => (s as HTMLInputElement).name === 'ReadRatioPercentage');
    if (!readSlider) throw new Error('ReadRatioPercentage slider not found');

    fireEvent.change(readSlider, { target: { value: '60' } });

    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({
      ReadRatioPercentage: 60,
      WriteRatioPercentage: 40
    }));
  });

  it('should call onChange when preset button is clicked', () => {
    render(<MetricsForm metrics={mockMetrics} onChange={onChange} />);

    // Find preset button "1M" for DAU
    const presetBtn = screen.getByText('1M');
    fireEvent.click(presetBtn);

    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({
      DAU: 1000000
    }));
  });
});
