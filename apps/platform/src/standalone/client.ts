/**
 * Standalone App Client
 * HTTP client for communicating with self-hosted standalone apps
 */

import type {
  RevenueDataPoint,
  HealthStatus,
  DataSignature,
} from '@openrevenueorg/shared';
import { verifySignature as verifyEd25519, isDataStale } from '@/lib/verification';

export interface StandaloneClientConfig {
  endpoint: string;
  apiKey: string;
  publicKey?: string;
}

export interface FetchRevenueRequest {
  startDate: string; // ISO date
  endDate: string; // ISO date
  interval?: 'daily' | 'monthly';
}

export class StandaloneClient {
  private config: StandaloneClientConfig;

  constructor(config: StandaloneClientConfig) {
    this.config = config;
  }

  /**
   * Validate connection to standalone app
   */
  async validateConnection(): Promise<boolean> {
    try {
      const health = await this.getHealthStatus();
      return health.status !== 'unhealthy';
    } catch (error) {
      return false;
    }
  }

  /**
   * Fetch revenue data from standalone app
   */
  async fetchRevenue(request: FetchRevenueRequest): Promise<RevenueDataPoint[]> {
    const response = await this.makeRequest<{ data: RevenueDataPoint[] }>(
      '/api/v1/revenue',
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    );

    return response.data;
  }

  /**
   * Get health status of standalone app
   */
  async getHealthStatus(): Promise<HealthStatus> {
    return this.makeRequest<HealthStatus>('/api/v1/health');
  }

  /**
   * Fetch signed data (with cryptographic verification)
   */
  async fetchSignedRevenue(
    request: FetchRevenueRequest
  ): Promise<RevenueDataPoint[]> {
    const response = await this.makeRequest<DataSignature>(
      '/api/v1/revenue/signed',
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    );

    // Verify signature
    if (!this.verifySignature(response)) {
      throw new Error('Signature verification failed - data may be forged');
    }
    
    // Warn if signature is stale
    if (isDataStale(response.timestamp, 10)) {
      const ageMinutes = Math.floor((Date.now() - response.timestamp) / 60000);
      console.warn(`Signature is ${ageMinutes} minutes old`);
    }

    // Parse and return data
    return JSON.parse(response.data);
  }

  /**
   * Make authenticated request to standalone app
   */
  private async makeRequest<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.config.endpoint.replace(/\/$/, '')}${path}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.config.apiKey,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'Request failed',
      }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  /**
   * Verify cryptographic signature using Ed25519
   */
  private verifySignature(signedData: DataSignature): boolean {
    try {
      // Use stored public key if available, fallback to response key
      const publicKey = this.config.publicKey || signedData.publicKey;
      
      if (!publicKey) {
        console.error('No public key available for verification');
        return false;
      }
      
      // Verify Ed25519 signature
      return verifyEd25519(
        signedData.data,
        signedData.signature,
        publicKey
      );
    } catch (error) {
      console.error('Signature verification error:', error);
      return false;
    }
  }
}
