import Decimal from 'decimal.js';

export const SECONDS_IN_DAY = 86400;
export const DAYS_IN_MONTH = 30;
export const HOURS_IN_MONTH_AVG = 730;

export const DEFAULT_PEAK_FACTOR = 2.0;
export const DEFAULT_REPLICATION_FACTOR = 3;

// Set up Decimal configuration
Decimal.set({ precision: 10, rounding: Decimal.ROUND_HALF_UP });
