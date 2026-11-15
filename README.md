# Weather App

A small weather app built with Next.js (App Router), TypeScript and Tailwind
CSS. The UI talks only to this project's own `/api/weather` route, which
proxies [Open-Meteo](https://open-meteo.com) for geocoding and forecasts.

## Features

- Search current conditions by city name
- "Use my location" via the browser's geolocation (with permission)
- Save up to 8 favourite cities with ★ and reopen them in one click (remembered across visits)
- Current temperature, feels-like, humidity and wind
- 7-day forecast with highs, lows and chance of rain
- Temperature trend chart of daily highs and lows (follows °C/°F and the theme)
- Switch temperatures between °C and °F (remembered across visits)
- Loading, empty and error states
- Light, dark or system theme toggle (remembered, no flash on reload)

## Running locally

Requires [Bun](https://bun.sh).

```bash
bun install
bun dev
```

Open [http://localhost:3000](http://localhost:3000). No API key is needed.

## Testing

Unit tests use Bun's built-in runner and live next to the code they cover
(`*.test.ts`). Open-Meteo is never called; tests stub `fetch`.

```bash
bun test
bun run typecheck
bun run lint
```

### API tests (Postman)

`tests/postman/weather-api.postman_collection.json` checks the `/api/weather`
contract: response shape for city and coordinate lookups, every `400`
validation message, the `404` for an unknown city, and the `{ "error": string }`
error body. It calls the live Open-Meteo API, so start the app first.

```bash
bun run dev
bun run test:api
```

`test:api` uses the [Postman CLI](https://learning.postman.com/docs/postman-cli/postman-cli-installation/).
To use the Postman app instead, import the collection and
`tests/postman/local.postman_environment.json`, then run the collection.
`newman run` also works with the same two files.

### End-to-end tests (Selenium)

`tests/e2e/weather.e2e.ts` drives Chrome through each user story: searching,
the unknown-city error, °C/°F, dark mode, favourite cities and the phone
layout. Selenium Manager downloads a matching ChromeDriver on first run.

```bash
bun run dev
bun run test:e2e
HEADED=1 bun run test:e2e
E2E_BASE_URL=https://staging.example.test bun run test:e2e
```

`HEADED=1` shows the browser while the tests run. `E2E_BASE_URL` points the
tests at another host.

Neither suite runs in CI or the git hooks, because both need a running app and
network access. `bun test` runs only the unit tests.

## Quality checks

| Where                                       | Runs                                                                                  |
| ------------------------------------------- | ------------------------------------------------------------------------------------- |
| Husky `pre-commit` (lint-staged)            | ESLint `--fix` and Prettier on staged files                                           |
| Husky `pre-push`                            | `bun run typecheck`, `bun test`                                                       |
| GitHub Actions (`.github/workflows/ci.yml`) | ESLint, Prettier check, typecheck, tests, `next build` on every PR and push to `main` |

ESLint includes `eslint-plugin-prettier`, so formatting drift fails lint too.

## Weather API

### `GET /api/weather`

Returns current conditions and a 7-day daily forecast. Provide **either** a
city name **or** coordinates. If `city` is present it takes precedence.

| Param  | Type   | Rules                                     |
| ------ | ------ | ----------------------------------------- |
| `city` | string | Non-blank, at most 100 characters         |
| `lat`  | number | Required with `lon`; between -90 and 90   |
| `lon`  | number | Required with `lat`; between -180 and 180 |

Examples:

```
/api/weather?city=Ahmedabad
/api/weather?lat=23.02&lon=72.57
```

Coordinate lookups return `"name": "Your location"` and `"country": null`.
The timezone is filled in from the forecast response.

### Response `200` (`WeatherReport` in `lib/weather/types.ts`)

```json
{
  "location": {
    "name": "Ahmedabad",
    "country": "India",
    "latitude": 23.02579,
    "longitude": 72.58727,
    "timezone": "Asia/Kolkata"
  },
  "current": {
    "time": "2026-11-13T14:30",
    "temperatureC": 31.2,
    "feelsLikeC": 30.4,
    "humidityPercent": 28,
    "windSpeedKmh": 9.8,
    "isDay": true,
    "condition": { "code": 0, "label": "Clear sky", "icon": "☀️" }
  },
  "daily": [
    {
      "date": "2026-11-13",
      "maxC": 32.5,
      "minC": 18.9,
      "precipitationChancePercent": 0,
      "condition": { "code": 1, "label": "Mainly clear", "icon": "🌤️" }
    }
  ]
}
```

`daily` has 7 entries. `precipitationChancePercent` may be `null`. `time` and
`date` are local to the location's timezone. Unknown weather codes are
reported as `{ "label": "Unknown", "icon": "🌡️" }`.

### Errors (`{ "error": string }`)

| Status | When                                                                                        |
| ------ | ------------------------------------------------------------------------------------------- |
| `400`  | No `city` and no `lat`/`lon`; blank or too-long `city`; invalid or out-of-range coordinates |
| `404`  | `city` could not be geocoded, e.g. `City "Xyzzyqwplk" not found`                            |
| `502`  | Open-Meteo returned an error or was unreachable (`Weather service unavailable`)             |
