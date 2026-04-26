export interface BusinessMetrics {
    DAU: number;
    RequestsPerUser: number;
    PeakFactor?: number;
    ReadRatioPercentage: number;
    WriteRatioPercentage: number;
    AvgPayloadSizeBytes: number;
    AvgResponseSizeBytes: number;
    RetentionDays: number;
    ReplicationFactor?: number;
}

export interface InfrastructureProjections {
    avgQPS: number;
    peakQPS: number;
    readQPS: number;
    writeQPS: number;
    totalStorageGB: number;
    totalEgressGB: number;
}
