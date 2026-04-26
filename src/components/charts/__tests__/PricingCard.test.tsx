import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PricingCard } from '../PricingCard';

// Mock I18nContext
vi.mock('@/lib/i18n/I18nContext', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const msgs: Record<string, string> = {
        mo: '/MO',
        mocked: 'MOCKED',
        live: 'LIVE',
        storageCost: 'STORAGE COST',
        dataEgress: 'DATA EGRESS'
      };
      return msgs[key] || key;
    },
    formatNumber: (num: number, options?: any) => {
      const minDecimals = options?.minimumFractionDigits !== undefined ? options.minimumFractionDigits : 0;
      return num.toFixed(Math.max(minDecimals, 0));
    },
    formatDataSize: (gb: number) => `${gb} GB`,
    getStorageDetails: (gb: number) => `${gb} GB detail`,
  }),
}));

describe('PricingCard Component', () => {
  const defaultProps = {
    providerCode: 'AWS',
    providerTitle: 'AMAZON WEB SERVICES',
    totalUsd: 1250.50,
    totalBrl: 6252.50,
    isMocked: false,
    storageCostUsd: 500.00,
    egressCostUsd: 750.50,
    themeColor: 'orange' as const
  };

  it('should render provider info and totals correctly', () => {
    render(<PricingCard {...defaultProps} />);

    expect(screen.getByText('AWS')).toBeInTheDocument();
    expect(screen.getByText('AMAZON WEB SERVICES')).toBeInTheDocument();
    expect(screen.getByText('$1250.50')).toBeInTheDocument();
  });

  it('should show LIVE badge when isMocked is false', () => {
    render(<PricingCard {...defaultProps} isMocked={false} />);
    expect(screen.getByText('LIVE')).toBeInTheDocument();
  });

  it('should show MOCKED badge when isMocked is true', () => {
    render(<PricingCard {...defaultProps} isMocked={true} />);
    expect(screen.getByText('MOCKED')).toBeInTheDocument();
  });

  it('should apply correct theme class', () => {
    const { container } = render(<PricingCard {...defaultProps} themeColor="red" />);
    // The red theme uses border-paper-outline/80
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('border-paper-outline/20'); // Base class
  });

  it('should render detailed costs', () => {
    render(<PricingCard {...defaultProps} />);
    expect(screen.getByText('$500.00')).toBeInTheDocument();
    expect(screen.getByText('$750.50')).toBeInTheDocument();
  });
});
