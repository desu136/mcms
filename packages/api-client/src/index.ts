import ky, { type KyInstance, type Options } from 'ky';
import type {
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  HealthCheckResponse,
} from '@mcms/contracts';
import { API_PREFIX } from '@mcms/domain';

export interface McmsApiClientConfig {
  baseUrl: string;
  /** Called when a request needs the current access token */
  getAccessToken?: () => string | null;
  /** Called when a 401 is received — implement token refresh logic here */
  onUnauthorized?: () => Promise<void>;
}

export class McmsApiClient {
  private readonly http: KyInstance;

  constructor(private readonly config: McmsApiClientConfig) {
    const sanitizedBase = config.baseUrl.replace(/\/+$/, '');
    const prefixUrl = sanitizedBase.endsWith(API_PREFIX)
      ? sanitizedBase
      : `${sanitizedBase}${API_PREFIX}`;

    this.http = ky.create({
      prefixUrl,
      timeout: 30_000,
      retry: {
        limit: 2,
        methods: ['get'],
        statusCodes: [429, 502, 503, 504],
      },
      hooks: {
        beforeRequest: [
          (request) => {
            const token = config.getAccessToken?.();
            if (token) {
              request.headers.set('Authorization', `Bearer ${token}`);
            }
          },
        ],
        afterResponse: [
          async (_request, _options, response) => {
            if (response.status === 401) {
              await config.onUnauthorized?.();
            }
            return response;
          },
        ],
      },
    });
  }

  // ─── Health ────────────────────────────────────────────────────────────────

  async health(): Promise<HealthCheckResponse> {
    return this.http.get('health').json<HealthCheckResponse>();
  }

  // ─── Auth ──────────────────────────────────────────────────────────────────

  async login(body: LoginRequest): Promise<LoginResponse> {
    return this.http.post('auth/login', { json: body }).json<LoginResponse>();
  }

  async refreshToken(body: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    return this.http.post('auth/refresh', { json: body }).json<RefreshTokenResponse>();
  }

  async logout(): Promise<void> {
    await this.http.post('auth/logout');
  }
}

export function createMcmsApiClient(config: McmsApiClientConfig): McmsApiClient {
  return new McmsApiClient(config);
}
