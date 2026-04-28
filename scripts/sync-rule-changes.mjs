#!/usr/bin/env node
// Pulls IANA tzdata NEWS, extracts the IANA zones mentioned in the last
// MONTHS_BACK months of release notes, writes a {zone: snippet} map to
// public/rule-changes.json. Used by the weekly GitHub Action sync workflow.
import { writeFile } from 'node:fs/promises';

const NEWS_URL = 'https://data.iana.org/time-zones/tzdb/NEWS';
// Match IANA zone names of the shape Continent/City or Continent/Region/City.
// Restrict to the IANA convention: TitleCase segments separated by /.
const ZONE_REGEX = /\b([A-Z][a-z]+(?:_[A-Za-z]+)?\/[A-Za-z_]+(?:\/[A-Za-z_]+)?)\b/g;
const MONTHS_BACK = 18;
const OUTPUT_PATH = 'public/rule-changes.json';

async function main() {
  const res = await fetch(NEWS_URL);
  if (!res.ok) {
    console.error(`Failed to fetch IANA NEWS: ${res.status}`);
    process.exit(1);
  }
  const news = await res.text();

  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - MONTHS_BACK);

  // IANA NEWS is reverse-chronological with headers like
  // "Release 2026a - 2026-04-22 23:06:43 -0700".
  // Split on those headers and capture the YYYY-MM-DD date.
  const parts = news.split(/^Release\s+\S+\s*-\s*(\d{4}-\d{2}-\d{2})/m).slice(1);
  const recent = [];
  for (let i = 0; i < parts.length; i += 2) {
    const date = new Date(parts[i]);
    if (Number.isNaN(date.getTime()) || date < cutoff) break;
    recent.push({ date, body: parts[i + 1] ?? '' });
  }

  const zoneToSnippet = {};
  for (const { body } of recent) {
    for (const match of body.matchAll(ZONE_REGEX)) {
      const zone = match[1];
      if (zoneToSnippet[zone]) continue; // Keep the most-recent mention only.
      const idx = match.index ?? 0;
      const snippet = body.slice(idx, idx + 200).split(/(?<=[.!?])\s/)[0];
      zoneToSnippet[zone] = snippet.replace(/\s+/g, ' ').trim();
    }
  }

  await writeFile(OUTPUT_PATH, JSON.stringify(zoneToSnippet, null, 2) + '\n');
  console.log(`Wrote ${Object.keys(zoneToSnippet).length} entries to ${OUTPUT_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
