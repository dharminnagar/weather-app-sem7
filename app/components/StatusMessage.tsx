export type StatusMessageProps = {
  status: 'idle' | 'loading' | 'error';
  message?: string;
};

const DEFAULT_ERROR_MESSAGE = 'Something went wrong. Please try again.';

export function StatusMessage({ status, message }: StatusMessageProps) {
  switch (status) {
    case 'idle':
      return (
        <div className="rounded-2xl border border-dashed border-zinc-300 p-8 text-center dark:border-zinc-700">
          <p aria-hidden="true" className="text-4xl">
            🌍
          </p>
          <p className="mt-3 font-medium">Check the weather anywhere</p>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {message ?? 'Search for a city or use your current location.'}
          </p>
        </div>
      );
    case 'loading':
      return <LoadingSkeleton />;
    case 'error':
      return (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-red-300 bg-red-50 p-4 text-red-900 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200"
        >
          <span aria-hidden="true" className="text-xl leading-none">
            ⚠️
          </span>
          <p className="text-sm font-medium">
            {message ?? DEFAULT_ERROR_MESSAGE}
          </p>
        </div>
      );
  }
}

const skeletonBlock = 'rounded-md bg-zinc-200 dark:bg-zinc-800';

function LoadingSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="animate-pulse rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <span className="sr-only">Loading weather…</span>
      <div aria-hidden="true">
        <div className="flex justify-between gap-4">
          <div className={`h-6 w-40 ${skeletonBlock}`} />
          <div className={`h-4 w-24 ${skeletonBlock}`} />
        </div>
        <div className="mt-5 flex items-center gap-4">
          <div className={`size-16 rounded-full ${skeletonBlock}`} />
          <div className="space-y-2">
            <div className={`h-12 w-32 ${skeletonBlock}`} />
            <div className={`h-4 w-24 ${skeletonBlock}`} />
          </div>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
          {['feels-like', 'humidity', 'wind'].map((detail) => (
            <div key={detail} className="space-y-2">
              <div className={`h-3 w-16 ${skeletonBlock}`} />
              <div className={`h-5 w-12 ${skeletonBlock}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
