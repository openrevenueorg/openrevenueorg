/**
 * Standalone App Client
 * HTTP client for communicating with self-hosted standalone apps
 */

import type {
  RevenueDataPoint,
  HealthStatus,
  DataSignature,
} from '@openrevenue/shared';

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
  ): Promise<DataSignature> {
    const response = await this.makeRequest<DataSignature>(
      '/api/v1/revenue/signed',
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    );

    // Verify signature if public key is available
    if (this.config.publicKey) {
      const isValid = this.verifySignature(response);
      if (!isValid) {
        throw new Error('Data signature verification failed');
      }
    }

    return response;
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
   * Verify cryptographic signature
   */
  private verifySignature(signedData: DataSignature): boolean {
    // TODO: Implement actual signature verification
    // This would use the publicKey to verify the signature
    // For now, return true as placeholder
    return true;
  }
}
