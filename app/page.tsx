import { CurrentWeather } from './components/CurrentWeather';
import { Forecast } from './components/Forecast';
import { SampleControls } from './components/SampleControls';
import { StatusMessage } from './components/StatusMessage';
import { sampleWeatherReport } from './lib/sample-weather';

export default function Home() {
  const { location, current, daily } = sampleWeatherReport;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
      <header className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Weather</h1>
        <SampleControls />
      </header>

      <CurrentWeather location={location} current={current} />
      <Forecast daily={daily} />

      <section
        aria-labelledby="states-preview-heading"
        className="flex flex-col gap-4 border-t border-zinc-200 pt-6 dark:border-zinc-800"
      >
        <h2
          id="states-preview-heading"
          className="text-xl font-semibold tracking-tight"
        >
          States preview
        </h2>
        <StatusMessage status="idle" />
        <StatusMessage status="loading" />
        <StatusMessage status="error" message='City "Atlantis" not found' />
      </section>
    </main>
  );
}
