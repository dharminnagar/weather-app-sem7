'use client';

import { LocationButton } from './LocationButton';
import { SearchBar } from './SearchBar';

export function SampleControls() {
  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <SearchBar onSearch={(city) => console.info('Search requested:', city)} />
      <LocationButton onLocate={() => console.info('Location requested')} />
    </div>
  );
}
