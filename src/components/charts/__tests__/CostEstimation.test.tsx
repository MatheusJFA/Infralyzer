import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CostEstimation } from '../CostEstimation';

// Mock I18nContext
vi.mock('@/lib/i18n/I18nContext', () => ({
  useTranslation: () => ({
    t: (key: string, params?: any) => key === 'sysInfoPricing' ? `Rate: ${params.rate}` : key,
    formatNumber: (num: number, options?: any) => {
      const minDecimals = options?.minimumFractionDigits !== undefined ? options.minimumFractionDigits : 0;
      return num.toFixed(Math.max(minDecimals, 0));
    },
    formatDataSize: (gb: number) => `${gb} GB`,
    getStorageDetails: (gb: number) => `${gb} GB detail`,
  }),
}));

// Mock components
vi.mock('../PricingCard', () => ({
  PricingCard: ({ providerCode, totalUsd }: any) => (
    <div data-testid="pricing-card">
      {providerCode}: {totalUsd.toFixed(2)}
    </div>
  ),
}));

describe('CostEstimation Component', () => {
  const mockProjections = {
    totalStorageGB: 100,
    totalEgressGB: 50,
    avgQPS: 1,
    peakQPS: 2,
    readQPS: 0.8,
    writeQPS: 0.2,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock global fetch
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ pricePerGB: 0.1, status: 'live', rates: { BRL: 5.0 } }),
    });

    // Mock localStorage
    const localStorageMock = (() => {
      let store: Record<string, string> = {};
      return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => { store[key] = value.toString(); },
        clear: () => { store = {}; }
      };
    })();
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
  });

  it('should show loading state initially', () => {
    render(<CostEstimation projections={mockProjections} />);
    expect(screen.getByText('loadingPricing')).toBeInTheDocument();
  });

  it('should render pricing cards after loading', async () => {
    render(<CostEstimation projections={mockProjections} />);

    await waitFor(() => {
      expect(screen.queryByText('loadingPricing')).not.toBeInTheDocument();
    });

    const cards = screen.getAllByTestId('pricing-card');
    expect(cards).toHaveLength(4);
    // 100GB * 0.1 + 50GB * 0.1 = 10 + 5 = 15
    expect(screen.getByText(/\[AWS\]: 15.00/)).toBeInTheDocument();
  });

  it('should display exchange rate in banner', async () => {
    render(<CostEstimation projections={mockProjections} />);

    await waitFor(() => {
      // The component has hardcoded message + formatNumber output
      expect(screen.getByText(/SYS_INFO: PRICING SOURCED FROM PUBLIC CLOUD APIS/)).toBeInTheDocument();
    });
  });
});
