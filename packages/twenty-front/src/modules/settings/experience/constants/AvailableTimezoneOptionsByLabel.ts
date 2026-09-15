import { IANA_TIME_ZONES } from 'twenty-shared/constants';
import { formatTimeZoneLabel } from '@/localization/utils/formatTimeZoneLabel';
import { type SelectOption } from 'twenty-ui/input';

// formatTimeZoneLabel is an Intl + date-fns-tz round trip. The previous
// implementation called it SIX times per zone (three .includes checks, the
// `in result` check, the key, and the label) across 594 zones -- ~3,500 calls
// -- and spread the accumulator on every iteration, which is O(n^2). Measured
// at ~785 ms of module-init time on a real page load.
//
// Same output: one call per zone, and a mutated accumulator.
const { AVAILABLE_TIME_ZONE_OPTIONS_BY_LABEL } = {
  AVAILABLE_TIME_ZONE_OPTIONS_BY_LABEL: IANA_TIME_ZONES.reduce<
    Record<string, SelectOption>
  >((result, ianaTimeZone) => {
    const label = formatTimeZoneLabel(ianaTimeZone);
    const abbreviation = label.slice(11);

    // Skip time zones with GMT, UTC, or UCT in their name, and duplicates.
    if (
      abbreviation.includes('GMT') ||
      abbreviation.includes('UTC') ||
      abbreviation.includes('UCT') ||
      label in result
    ) {
      return result;
    }

    result[label] = { label, value: ianaTimeZone };

    return result;
  }, {}),
};

export { AVAILABLE_TIME_ZONE_OPTIONS_BY_LABEL };
