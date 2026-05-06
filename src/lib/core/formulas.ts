import Decimal from 'decimal.js';
import { SECONDS_IN_DAY, DAYS_IN_MONTH } from './constants';

export function calculateQPS(dau: number, reqPerUser: number): Decimal {
    const totalReqs = new Decimal(dau).mul(reqPerUser);
    return totalReqs.div(SECONDS_IN_DAY);
}

export function calculatePeakQPS(avgQps: Decimal, peakFactor: number): Decimal {
    return avgQps.mul(peakFactor);
}

export function calculateMonthlyStorageGB(writeQPS: Decimal, payloadSizeBytes: number, retentionDays: number, replicationFactor: number): Decimal {
    const writesPerDay = writeQPS.mul(SECONDS_IN_DAY);
    const bytesPerDay = writesPerDay.mul(payloadSizeBytes);
    const totalBytes = bytesPerDay.mul(retentionDays).mul(replicationFactor);
    return totalBytes.div(Math.pow(1024, 3)); // Convert to GB
}

export function calculateMonthlyEgressGB(readQPS: Decimal, responseSizeBytes: number): Decimal {
    const readsPerMonth = readQPS.mul(SECONDS_IN_DAY).mul(DAYS_IN_MONTH);
    const totalBytes = readsPerMonth.mul(responseSizeBytes);
    return totalBytes.div(Math.pow(1024, 3)); // Convert to GB
}
