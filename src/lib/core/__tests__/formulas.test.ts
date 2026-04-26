import { describe, it, expect } from 'vitest';
import { calculateQPS, calculatePeakQPS, calculateMonthlyStorageGB, calculateMonthlyEgressGB } from '../formulas';
import Decimal from 'decimal.js';

describe('Infralyze Formulas', () => {
    describe('calculateQPS', () => {
        it('should calculate QPS correctly', () => {
            const dau = 10000; // 10k users
            const reqPerUser = 8.64; // 8.64 reqs/user -> total 86400 reqs/day
            const result = calculateQPS(dau, reqPerUser);
            // 86400 / 86400 = 1 QPS
            expect(result.toNumber()).toBe(1);
        });

        it('should return 0 for zero DAU', () => {
            const result = calculateQPS(0, 10);
            expect(result.toNumber()).toBe(0);
        });
    });

    describe('calculatePeakQPS', () => {
        it('should apply peak factor correctly', () => {
            const avgQps = new Decimal(5);
            const peakFactor = 2.5;
            const result = calculatePeakQPS(avgQps, peakFactor);
            expect(result.toNumber()).toBe(12.5);
        });
    });

    describe('calculateMonthlyStorageGB', () => {
        it('should calculate monthly storage in GB correctly', () => {
            // 1 write QPS, 1KB payload, 30 days retention, 3x replication
            const writeQPS = new Decimal(1);
            const payloadSizeBytes = 1024;
            const retentionDays = 30;
            const replicationFactor = 3;

            const result = calculateMonthlyStorageGB(writeQPS, payloadSizeBytes, retentionDays, replicationFactor);

            // writesPerDay = 1 * 86400 = 86400
            // bytesPerDay = 86400 * 1024 = 88473600
            // totalBytes = 88473600 * 30 * 3 = 7,962,624,000
            // GB = 7,962,624,000 / (1024^3) ≈ 7.41577

            expect(result.toNumber()).toBeCloseTo(7.41577, 4);
        });
    });

    describe('calculateMonthlyEgressGB', () => {
        it('should calculate monthly egress in GB correctly', () => {
            // 1 read QPS, 1KB response
            const readQPS = new Decimal(1);
            const responseSizeBytes = 1024;

            const result = calculateMonthlyEgressGB(readQPS, responseSizeBytes);

            // readsPerMonth = 1 * 86400 * 30 = 2,592,000
            // totalBytes = 2,592,000 * 1024 = 2,654,208,000
            // GB = 2,654,208,000 / (1024^3) ≈ 2.4719

            expect(result.toNumber()).toBeCloseTo(2.4719, 4);
        });
    });

    describe('Edge Cases and Large Values', () => {
        it('should handle extremely high DAU (1 Billion)', () => {
            const result = calculateQPS(1_000_000_000, 10);
            // 10^10 / 86400 ≈ 115740.7407
            expect(result.toNumber()).toBeCloseTo(115740.7407, 4);
        });

        it('should handle zero payload size', () => {
            const result = calculateMonthlyStorageGB(new Decimal(100), 0, 30, 3);
            expect(result.toNumber()).toBe(0);
        });

        it('should handle zero retention days', () => {
            const result = calculateMonthlyStorageGB(new Decimal(100), 1024, 0, 3);
            expect(result.toNumber()).toBe(0);
        });

        it('should return huge values for years of retention with high QPS', () => {
            const result = calculateMonthlyStorageGB(new Decimal(10000), 1024 * 1024, 365, 3);
            // 10k QPS * 86400 * 1MB * 365 * 3
            // ≈ 946,080,000,000,000 bytes / 1024^3 ≈ 881,103.5 GB
            expect(result.toNumber()).toBeGreaterThan(800000);
        });
    });
});
