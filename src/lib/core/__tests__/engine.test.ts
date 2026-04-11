import { describe, it, expect} from 'vitest';
import { calculateInfrastructure} from '../engine';

describe('Infralyze Engine Engine', () => {
 it('should orchestrate all calculations correctly with default factors', () => {
 const metrics = {
 DAU: 100000,
 RequestsPerUser: 10,
 ReadRatioPercentage: 90,
 WriteRatioPercentage: 10,
 AvgPayloadSizeBytes: 1024,
 AvgResponseSizeBytes: 2048,
 RetentionDays: 30,
 // Leaving out PeakFactor and ReplicationFactor to use defaults
 };

 const result = calculateInfrastructure(metrics as any);

 // 100k users * 10 reqs = 1M reqs / 86400 ≈ 11.574 QPS
 expect(result.avgQPS).toBeCloseTo(11.574, 3);
 // Peak factor default is 2.0
 expect(result.peakQPS).toBeCloseTo(result.avgQPS * 2.0, 3);
 
 // Read is 90% of avgQPS
 expect(result.readQPS).toBeCloseTo(result.avgQPS * 0.9, 3);
 // Write is 10% of avgQPS
 expect(result.writeQPS).toBeCloseTo(result.avgQPS * 0.1, 3);
 });

 it('should respect custom peak and replication factors', () => {
 const metrics = {
 DAU: 10000,
 RequestsPerUser: 10,
 ReadRatioPercentage: 50,
 WriteRatioPercentage: 50,
 AvgPayloadSizeBytes: 1024,
 AvgResponseSizeBytes: 1024,
 RetentionDays: 30,
 PeakFactor: 4.5,
 ReplicationFactor: 5,
 };

 const result = calculateInfrastructure(metrics as any);
 expect(result.peakQPS).toBeCloseTo(result.avgQPS * 4.5, 3);
 });
});
