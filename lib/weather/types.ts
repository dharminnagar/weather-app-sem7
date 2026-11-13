export type Location = {
  name: string;
  country: string | null;
  latitude: number;
  longitude: number;
  timezone: string | null;
};

export type WeatherCondition = {
  code: number;
  label: string;
  icon: string;
};

export type CurrentWeather = {
  time: string;
  temperatureC: number;
  feelsLikeC: number;
  humidityPercent: number;
  windSpeedKmh: number;
  isDay: boolean;
  condition: WeatherCondition;
};

export type DailyForecast = {
  date: string;
  maxC: number;
  minC: number;
  precipitationChancePercent: number | null;
  condition: WeatherCondition;
};

export type WeatherReport = {
  location: Location;
  current: CurrentWeather;
  daily: DailyForecast[];
};

export type WeatherErrorBody = {
  error: string;
};
