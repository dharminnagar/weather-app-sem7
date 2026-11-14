const weekdayFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  timeZone: 'UTC',
});

/** Parses at UTC noon and formats in UTC so the weekday never shifts by a day. */
export const formatDayLabel = (isoDate: string, index: number): string =>
  index === 0
    ? 'Today'
    : weekdayFormatter.format(new Date(`${isoDate}T12:00:00Z`));
