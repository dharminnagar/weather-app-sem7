import { WeatherApp } from './components/WeatherApp';

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Weather</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Current conditions and a 7-day forecast for any city.
        </p>
      </header>

      <WeatherApp />
    </main>
  );
}
