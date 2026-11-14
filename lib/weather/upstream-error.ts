/** Why a weather provider could not answer: an HTTP status, or no usable response at all. */
export type UpstreamFailure = number | 'unreachable' | 'invalid-response';

/**
 * Thrown by a `WeatherProvider` for any failure of the service behind it, so
 * callers can answer 502 without knowing how that service is reached.
 */
export class UpstreamError extends Error {
  constructor(
    readonly service: string,
    readonly failure: UpstreamFailure,
    options?: ErrorOptions
  ) {
    super(
      typeof failure === 'number'
        ? `${service} responded with HTTP ${failure}`
        : `${service} failed: ${failure}`,
      options
    );
    this.name = 'UpstreamError';
  }
}
