import { getTimezoneOffset } from 'date-fns-tz';

import { AVAILABLE_TIME_ZONE_OPTIONS_BY_LABEL } from '@/settings/experience/constants/AvailableTimezoneOptionsByLabel';

// getTimezoneOffset was called twice per comparison, so O(n log n) * 2 calls
// over ~380 options. Precompute one offset per option instead.
const { AVAILABLE_TIMEZONE_OPTIONS } = {
  AVAILABLE_TIMEZONE_OPTIONS: Object.values(AVAILABLE_TIME_ZONE_OPTIONS_BY_LABEL)
    .map((option) => ({ option, offset: getTimezoneOffset(option.value) }))
    .sort((a, b) =>
      a.offset - b.offset === 0
        ? // Sort alphabetically if the time zone offsets are the same.
          a.option.label.localeCompare(b.option.label)
        : // Sort by time zone offset if different.
          a.offset - b.offset,
    )
    .map(({ option }) => option),
};

export { AVAILABLE_TIMEZONE_OPTIONS };
