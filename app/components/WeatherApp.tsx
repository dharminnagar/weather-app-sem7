'use client';

import { locate } from '@/lib/geolocation';
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

export function WeatherApp() {
  const { state, searchCity, searchCoords, startLoading, fail } = useWeather();
  const [unit] = temperatureUnitPreference.use();
  const isLoading = state.status === 'loading';

  const locateUser = (): void => {
    startLoading();
    locate(navigator.geolocation).then(
      ({ latitude, longitude }) => searchCoords(latitude, longitude),
      (error: Error) => fail(error.message)
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
