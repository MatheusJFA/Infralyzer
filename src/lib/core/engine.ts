import {
 calculateQPS,
 calculatePeakQPS,
 calculateMonthlyStorageGB,
 calculateMonthlyEgressGB,
} from './formulas';
import { DEFAULT_PEAK_FACTOR, DEFAULT_REPLICATION_FACTOR} from './constants';
import type { BusinessMetrics, InfrastructureProjections} from '@/types';

// The Engine orchestrates all calculations
export function calculateInfrastructure(metrics: BusinessMetrics): InfrastructureProjections {
 const avgQPS = calculateQPS(metrics.DAU, metrics.RequestsPerUser);
 const peakQPS = calculatePeakQPS(avgQPS, metrics.PeakFactor || DEFAULT_PEAK_FACTOR);

 const readQPS = avgQPS.mul(metrics.ReadRatioPercentage / 100);
 const writeQPS = avgQPS.mul(metrics.WriteRatioPercentage / 100);

 const totalStorageGB = calculateMonthlyStorageGB(
 writeQPS,
 metrics.AvgPayloadSizeBytes,
 metrics.RetentionDays,
 metrics.ReplicationFactor || DEFAULT_REPLICATION_FACTOR
 );

 const totalEgressGB = calculateMonthlyEgressGB(
 readQPS,
 metrics.AvgResponseSizeBytes
 );

 return {
 avgQPS: avgQPS.toNumber(),
 peakQPS: peakQPS.toNumber(),
 readQPS: readQPS.toNumber(),
 writeQPS: writeQPS.toNumber(),
 totalStorageGB: totalStorageGB.toNumber(),
 totalEgressGB: totalEgressGB.toNumber(),
 };
}
