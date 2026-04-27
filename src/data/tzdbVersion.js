import pkg from '@vvo/tzdb/package.json' with { type: 'json' };

// Prefer an explicit tzdata field if upstream ever adds one, otherwise the
// package version is a reasonable proxy for "which dataset are we on".
export const TZDB_VERSION = pkg.tzdataVersion ?? pkg.version ?? 'unknown';
