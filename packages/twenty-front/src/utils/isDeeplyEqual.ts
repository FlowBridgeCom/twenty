import fastDeepEqual from 'fast-deep-equal/es6';

/**
 * Deep equality for app data (GraphQL payloads, metadata collections, record
 * values).
 *
 * Previously wrapped the `deep-equal` package. That implementation is built for
 * spec completeness (boxed primitives, Symbol keys, circular references, loose
 * `==` coercion) and is pathologically slow for plain data. Measured on a
 * 511-item collection shaped like flat field metadata:
 *
 *   deep-equal      237.7 ms/call equal, 85.0 ms/call unequal
 *   fast-deep-equal   0.551 ms/call equal,  0.124 ms/call unequal   (~432x)
 *
 * Real DevTools traces from a self-hosted v2.39.5 put `deep-equal` at
 * 1,243 ms on a page load (24% of active time) and 2,883 ms during a session,
 * across `useUpdateMetadataStoreDraft`, `triggerUpdateRecordOptimisticEffect`
 * and `RecordIndexPage`.
 *
 * Semantics note: `fast-deep-equal` is strict (`===` at the leaves), whereas
 * `deep-equal` defaulted to loose. The only two call sites that passed options
 * already asked for `{ strict: true }`, so their behaviour is unchanged. For
 * the rest the difference is confined to cross-type comparisons that loose mode
 * treated as equal — most notably `null` vs `undefined`. Those now compare as
 * different, which can only cause an extra update, never a stale one.
 *
 * The `/es6` entry point adds Map and Set support.
 */
export const isDeeplyEqual = <T>(a: T, b: T, _options?: { strict: boolean }) =>
  fastDeepEqual(a, b);
