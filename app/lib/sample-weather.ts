import type { WeatherReport } from '@/lib/weather/types';

export const sampleWeatherReport: WeatherReport = {
  location: {
    name: 'Ahmedabad',
    country: 'India',
    latitude: 23.02579,
    longitude: 72.58727,
    timezone: 'Asia/Kolkata',
  },
  current: {
    time: '2026-11-13T09:45',
    temperatureC: 24.6,
    feelsLikeC: 24.1,
    humidityPercent: 41,
    windSpeedKmh: 7.6,
    isDay: true,
    condition: { code: 1, label: 'Mainly clear', icon: '🌤️' },
  },
  daily: [
    {
      date: '2026-11-13',
      maxC: 32.5,
      minC: 18.9,
      precipitationChancePercent: 0,
      condition: { code: 1, label: 'Mainly clear', icon: '🌤️' },
    },
    {
      date: '2026-11-14',
      maxC: 33.1,
      minC: 19.4,
      precipitationChancePercent: 0,
      condition: { code: 0, label: 'Clear sky', icon: '☀️' },
    },
    {
      date: '2026-11-15',
      maxC: 32.2,
      minC: 19.8,
      precipitationChancePercent: 5,
      condition: { code: 2, label: 'Partly cloudy', icon: '⛅' },
    },
    {
      date: '2026-11-16',
      maxC: 30.4,
      minC: 20.6,
      precipitationChancePercent: 35,
      condition: { code: 61, label: 'Slight rain', icon: '🌦️' },
    },
    {
      date: '2026-11-17',
      maxC: 29.7,
      minC: 19.2,
      precipitationChancePercent: 15,
      condition: { code: 3, label: 'Overcast', icon: '☁️' },
    },
    {
      date: '2026-11-18',
      maxC: 31.3,
      minC: 18.5,
      precipitationChancePercent: null,
      condition: { code: 45, label: 'Fog', icon: '🌫️' },
    },
    {
      date: '2026-11-19',
      maxC: 32.0,
      minC: 18.1,
      precipitationChancePercent: 0,
      condition: { code: 0, label: 'Clear sky', icon: '☀️' },
    },
  ],
};
