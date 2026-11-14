'use client';

import { temperatureUnitPreference } from '@/lib/weather/units';
import { useWeather } from '../hooks/useWeather';
import { CurrentWeather } from './CurrentWeather';
import { FavouriteButton } from './FavouriteButton';
import { FavouriteCities } from './FavouriteCities';
import { Forecast } from './Forecast';
import { LocationButton } from './LocationButton';
import { SearchBar } from './SearchBar';
import { StatusMessage } from './StatusMessage';
import { TemperatureTrend } from './TemperatureTrend';

const GEOLOCATION_OPTIONS: PositionOptions = {
  timeout: 10_000,
  maximumAge: 600_000,
};

const describeGeolocationError = (error: GeolocationPositionError): string =>
  error.code === error.PERMISSION_DENIED
    ? 'Location permission was denied. Search for a city instead.'
    : 'Could not determine your location.';

export function WeatherApp() {
  const { state, searchCity, searchCoords, startLoading, fail } = useWeather();
  const [unit] = temperatureUnitPreference.use();
  const isLoading = state.status === 'loading';

  const locateUser = (): void => {
    if (!('geolocation' in navigator)) {
      fail('Your browser does not support location access.');
      return;
    }
    startLoading();
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => searchCoords(coords.latitude, coords.longitude),
      (error) => fail(describeGeolocationError(error)),
      GEOLOCATION_OPTIONS
    );
  };

  return (
    <>
      <div className="flex flex-col gap-2 sm:flex-row">
        <SearchBar onSearch={searchCity} disabled={isLoading} />
        <LocationButton onLocate={locateUser} disabled={isLoading} />
      </div>

      <FavouriteCities onSelect={searchCity} disabled={isLoading} />

      {state.status === 'success' ? (
        <>
          <CurrentWeather
            location={state.report.location}
            current={state.report.current}
            unit={unit}
            headerAction={
              state.source === 'city' && (
                <FavouriteButton city={state.report.location} />
              )
            }
          />
          <TemperatureTrend daily={state.report.daily} unit={unit} />
          <Forecast daily={state.report.daily} unit={unit} />
        </>
      ) : (
        <StatusMessage
          status={state.status}
          message={state.status === 'error' ? state.message : undefined}
        />
      )}
    </>
  );
}
