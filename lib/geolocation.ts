export type Coordinates = { latitude: number; longitude: number };

/** The slice of `navigator.geolocation` this app uses, so tests can fake it. */
export type GeolocationSource = {
  getCurrentPosition: (
    onSuccess: (position: { coords: Coordinates }) => void,
    onError: (error: { code: number; PERMISSION_DENIED: number }) => void,
    options?: PositionOptions
  ) => void;
};

export const GEOLOCATION_MESSAGES = {
  unsupported: 'Your browser does not support location access.',
  denied: 'Location permission was denied. Search for a city instead.',
  failed: 'Could not determine your location.',
} as const;

const POSITION_OPTIONS: PositionOptions = {
  timeout: 10_000,
  maximumAge: 600_000,
};

/** Resolves with the device position, or rejects with a message fit to show the user. */
export function locate(
  geolocation: GeolocationSource | undefined
): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (geolocation === undefined) {
      reject(new Error(GEOLOCATION_MESSAGES.unsupported));
      return;
    }
    geolocation.getCurrentPosition(
      ({ coords }) =>
        resolve({ latitude: coords.latitude, longitude: coords.longitude }),
      (error) =>
        reject(
          new Error(
            error.code === error.PERMISSION_DENIED
              ? GEOLOCATION_MESSAGES.denied
              : GEOLOCATION_MESSAGES.failed
          )
        ),
      POSITION_OPTIONS
    );
  });
}
