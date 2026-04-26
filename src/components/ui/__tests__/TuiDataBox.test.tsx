import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TuiDataBox } from '../TuiDataBox';

// Mock InfoTooltip to focus on TuiDataBox behavior
vi.mock('@/components/InfoTooltip', () => ({
  InfoTooltip: ({ content }: { content: string }) => <div data-testid="tooltip">{content}</div>,
}));

// Mock I18nContext
vi.mock('@/lib/i18n/I18nContext', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    formatNumber: (num: number, options?: any) => {
      const minDecimals = options?.minimumFractionDigits !== undefined ? options.minimumFractionDigits : 0;
      return num.toFixed(Math.max(minDecimals, 0));
    },
    formatDataSize: (gb: number) => `${gb} GB`,
    getStorageDetails: (gb: number) => `${gb} GB detail`,
  }),
}));

describe('TuiDataBox Component', () => {
  it('should render label and value correctly', () => {
    render(<TuiDataBox label="Storage" value="500 GB" />);
    expect(screen.getByText('Storage')).toBeInTheDocument();
    expect(screen.getByText('500 GB')).toBeInTheDocument();
  });

  it('should apply large value styling by default', () => {
    render(<TuiDataBox label="L" value="V" />);
    const valueDiv = screen.getByText('V');
    expect(valueDiv.className).toContain('text-4xl');
  });

  it('should apply small value styling when largeValue is false', () => {
    render(<TuiDataBox label="L" value="V" largeValue={false} />);
    const valueDiv = screen.getByText('V');
    expect(valueDiv.className).toContain('text-xl');
  });

  it('should render subValue correctly', () => {
    render(<TuiDataBox label="L" value="V" subValue="Sub" />);
    expect(screen.getByText('Sub')).toBeInTheDocument();
  });
});
