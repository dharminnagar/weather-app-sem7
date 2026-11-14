import { createWeatherHandler } from '@/lib/weather/handler';
import { openMeteo } from '@/lib/weather/open-meteo';

/** Current weather and a 7-day forecast for `?city=` or `?lat=&lon=`. */
export const GET = createWeatherHandler(openMeteo);
