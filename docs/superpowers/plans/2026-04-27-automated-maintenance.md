# K-Tools Automated Maintenance Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to run this task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Status:** Approved on 2026-04-27. Not yet executed.

**Goal:** Cut human time spent maintaining K-Zone (and future K-Tools) to near zero. Two layers:

1. **(a) Renovate** keeps `@vvo/tzdb` and other deps current automatically.
2. **(c) GitHub Action** scans IANA `NEWS` weekly and PRs new rule-change zones into `public/rule-changes.json`.

Why this combination: layer (a) makes the **city catalog** stay current with upstream `@vvo/tzdb` releases. Layer (c) makes the **PolicyInfoIcon ℹ️ list** keep up with new IANA rule changes (provinces / countries adopting permanent DST etc.). The actual offset / DST math is already automatic via the browser's bundled IANA database; these two layers cover the build-time-pinned data we ship.

Execution order is **a → c** (c needs the CI workflow that lands in a).

---

## Task A: Renovate + CI

**Files:**
- Create: `renovate.json`
- Create: `.github/workflows/ci.yml`

### Step 1: Add CI workflow

Renovate's auto-merge depends on a passing status check. Land CI first.

`.github/workflows/ci.yml`:

```yaml
name: CI
on:
  push:
    branches: [main, master]
  pull_request:
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run test:run
      - run: npm run build
```

### Step 2: Add `renovate.json`

```json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": ["config:recommended"],
  "timezone": "America/Edmonton",
  "schedule": ["before 6am on monday"],
  "labels": ["dependencies"],
  "dependencyDashboard": true,
  "packageRules": [
    {
      "matchPackageNames": ["@vvo/tzdb"],
      "matchUpdateTypes": ["patch", "minor"],
      "automerge": true,
      "automergeType": "pr",
      "platformAutomerge": true,
      "groupName": "@vvo/tzdb (timezone data)",
      "labels": ["dependencies", "timezone-data"]
    },
    {
      "matchDepTypes": ["devDependencies"],
      "matchUpdateTypes": ["patch", "minor"],
      "automerge": true,
      "groupName": "dev dependencies"
    }
  ],
  "lockFileMaintenance": {
    "enabled": true,
    "schedule": ["before 6am on monday"]
  }
}
```

**Decision rationale:**

- **Schedule "before 6am on monday"**: small upgrades batched into one weekly review window; CI runs through the morning and merges before noon.
- **`@vvo/tzdb` patch + minor automerge**: tzdb 6.x minors only add IANA zones / metadata fixes; backwards compatible. Major bumps (e.g. 6.x → 7.x) skip automerge so a human reads the changelog.
- **Major never automerge**: covered implicitly by the absence of a `major` rule.
- **Dev deps automerge**: vitest / RTL / Vite minors are low risk, CI gates them.
- **`lockFileMaintenance`**: weekly refresh of transitive deps, primarily for security patches.
- **`platformAutomerge: true`**: uses GitHub's native auto-merge so Renovate doesn't poll.

### Step 3: One-time GitHub setup (user)

These are clicks in the GitHub UI, not commits:

1. Install the [Renovate App](https://github.com/apps/renovate) on the `k-tools` repo.
2. Settings → General → Pull Requests: enable "Allow auto-merge".
3. (Optional but recommended) Settings → Branches → add a rule for `main`:
   - "Require status checks to pass before merging"
   - Pick the `test` job from `.github/workflows/ci.yml`

### Step 4: Verify

After Renovate's first run (next Monday), expect:

- A `Dependency Dashboard` issue in the repo's Issues tab.
- One or more PRs labelled `dependencies`.
- PRs that pass CI auto-merge within a few hours.

### Step 5: Commit

```bash
git add renovate.json .github/workflows/ci.yml
git commit -m "chore: add Renovate + CI for automated dependency upgrades"
```

---

## Task C: Auto-sync IANA rule changes

**Why this layer is needed:** Browser DST math updates automatically; the city catalog updates via Task A. But `PolicyInfoIcon`'s "recently changed zone" list is currently a hardcoded JS map (`{ 'America/Edmonton': 'policy.albertaDst' }`). When Quebec or Egypt next changes its DST policy, that hardcoded list does not see it.

**Architecture:** split rule-change data into two layers, hardcoded + dynamic. Hardcoded entries map zone → i18n key for nicely localised messages. Dynamic entries map zone → English description from IANA NEWS (Action-generated). Component prefers hardcoded, falls back to dynamic.

**Files:**
- Modify: `src/data/ruleChanges.js`
- Modify: `src/data/ruleChanges.test.js`
- Modify: `src/components/PolicyInfoIcon.jsx`
- Modify: `src/components/PolicyInfoIcon.test.jsx`
- Modify: `src/locales/en.js`, `src/locales/zh.js` (one new key)
- Create: `public/rule-changes.json`
- Create: `scripts/sync-rule-changes.mjs`
- Create: `.github/workflows/sync-rule-changes.yml`
- Create: `docs/operations/automated-maintenance.md` (short ops note)

### Step 1: Refactor `ruleChanges.js` to two-layer data

```js
// src/data/ruleChanges.js
const STATIC_RULE_CHANGES = {
  'America/Edmonton': { messageKey: 'policy.albertaDst' },
};

let dynamicRuleChanges = {};

export async function loadRuleChanges() {
  try {
    const res = await fetch('/rule-changes.json');
    if (res.ok) dynamicRuleChanges = await res.json();
  } catch {
    // ignore; component falls back to STATIC_RULE_CHANGES only
  }
}

export function hasRecentRuleChange(timezone) {
  if (!timezone) return false;
  return Object.prototype.hasOwnProperty.call(STATIC_RULE_CHANGES, timezone)
      || Object.prototype.hasOwnProperty.call(dynamicRuleChanges, timezone);
}

export function getRuleChangeMessage(timezone, t) {
  if (!timezone) return null;
  const staticEntry = STATIC_RULE_CHANGES[timezone];
  if (staticEntry) return t(staticEntry.messageKey);
  const dynamicEntry = dynamicRuleChanges[timezone];
  if (dynamicEntry) {
    return `${t('policy.fallbackPrefix')} ${dynamicEntry}`;
  }
  return null;
}
```

`getRuleChangeMessageKey()` is removed; `getRuleChangeMessage(tz, t)` is the new single accessor that the component should call.

### Step 2: Update `ruleChanges.test.js`

Drop the `getRuleChangeMessageKey` cases. Add cases for `getRuleChangeMessage` (static and dynamic), and a `loadRuleChanges` smoke test that mocks `fetch`.

### Step 3: Update `PolicyInfoIcon.jsx` to call `loadRuleChanges` once + read via the new accessor

Trigger `loadRuleChanges()` on mount (the component is mounted whenever a timezone with a static entry is active; for everyone else the load is wasted but it's `< 5 KB`). Use `useState` + `useEffect` so re-render flips when dynamic data arrives.

```jsx
import { useEffect, useState } from 'react';
import { useT } from '../contexts/LanguageContext';
import { hasRecentRuleChange, getRuleChangeMessage, loadRuleChanges } from '../data/ruleChanges';
import './PolicyInfoIcon.css';

export default function PolicyInfoIcon({ timezone }) {
  const t = useT();
  const [, setLoaded] = useState(false);

  useEffect(() => {
    loadRuleChanges().finally(() => setLoaded(true));
  }, []);

  if (!hasRecentRuleChange(timezone)) return null;

  function handleClick(e) {
    e.stopPropagation();
    const msg = getRuleChangeMessage(timezone, t);
    if (msg) window.alert(msg);
  }

  return (
    <button
      type="button"
      className="policy-info"
      aria-label="Timezone rules updated"
      onClick={handleClick}
    >
      ℹ️
    </button>
  );
}
```

### Step 4: Update `PolicyInfoIcon.test.jsx`

Mock `fetch('/rule-changes.json')` to return `{}` for the existing tests so `loadRuleChanges` is a no-op. Add one new test that mocks the fetch with `{ "Africa/Cairo": "Egypt resumed DST in 2023" }` and confirms the dynamic-fallback path emits the prefixed string.

### Step 5: Add locale key

```js
// en.js
'policy.fallbackPrefix': 'Recent IANA rule change:',
// zh.js
'policy.fallbackPrefix': '近期 IANA 规则变更：',
```

### Step 6: Seed `public/rule-changes.json`

```json
{}
```

Empty seed. The Action will fill it on the first run.

### Step 7: Write the sync script

`scripts/sync-rule-changes.mjs`:

```js
#!/usr/bin/env node
import { writeFile } from 'node:fs/promises';

const NEWS_URL = 'https://data.iana.org/time-zones/tzdb/NEWS';
const ZONE_REGEX = /\b([A-Z][a-z]+(?:_[A-Za-z]+)?\/[A-Za-z_]+(?:\/[A-Za-z_]+)?)\b/g;
const MONTHS_BACK = 18;

const news = await fetch(NEWS_URL).then((r) => r.text());

// IANA NEWS is reverse-chronological with "Release YYYY-MM-DD" headers.
// Slice to the last MONTHS_BACK months by pairing each header with its body
// until cumulative time exceeds the cutoff.
const cutoff = new Date();
cutoff.setMonth(cutoff.getMonth() - MONTHS_BACK);

const releases = news.split(/^Release\s+(\d{4}-\d{2}-\d{2})/m).slice(1);
// `releases` is now [date, body, date, body, ...].
const recent = [];
for (let i = 0; i < releases.length; i += 2) {
  const date = new Date(releases[i]);
  if (date < cutoff) break;
  recent.push({ date, body: releases[i + 1] });
}

const zoneToSnippet = {};
for (const { body } of recent) {
  // Find the first sentence per zone mention as a short summary.
  for (const match of body.matchAll(ZONE_REGEX)) {
    const zone = match[1];
    if (zoneToSnippet[zone]) continue; // keep most-recent (we walk newest first)
    const idx = match.index ?? 0;
    const sentence = body.slice(idx, idx + 200).split(/(?<=[.!?])\s/)[0];
    zoneToSnippet[zone] = sentence.replace(/\s+/g, ' ').trim();
  }
}

await writeFile('public/rule-changes.json', JSON.stringify(zoneToSnippet, null, 2) + '\n');
console.log(`Wrote ${Object.keys(zoneToSnippet).length} entries to public/rule-changes.json`);
```

The regex is intentionally narrow: it only matches IANA zone names that contain a slash (e.g. `America/Edmonton`, `Asia/Tokyo`), avoiding false positives on continent names alone or on capitalised English words.

### Step 8: GitHub Action

`.github/workflows/sync-rule-changes.yml`:

```yaml
name: Sync IANA rule changes
on:
  schedule:
    - cron: '0 13 * * 1'
  workflow_dispatch:

jobs:
  sync:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: node scripts/sync-rule-changes.mjs
      - uses: peter-evans/create-pull-request@v6
        with:
          commit-message: 'chore: sync IANA rule changes from upstream NEWS'
          title: 'chore: sync IANA rule changes from upstream NEWS'
          branch: chore/sync-rule-changes
          delete-branch: true
          labels: timezone-data,automated
          body: |
            Auto-generated by `.github/workflows/sync-rule-changes.yml`.

            Review the diff in `public/rule-changes.json`. If a zone
            deserves a localised message, lift it into
            `STATIC_RULE_CHANGES` in `src/data/ruleChanges.js` and add
            i18n keys to `src/locales/en.js` + `zh.js`. Otherwise merge
            as is; the dynamic fallback in `getRuleChangeMessage` will
            surface the IANA description with the
            `policy.fallbackPrefix` key.
```

`workflow_dispatch` allows manual trigger from the GitHub UI when you want to force a sync without waiting for Monday.

### Step 9: Operations note

`docs/operations/automated-maintenance.md`:

```md
# Automated maintenance

K-Tools runs two unattended maintenance loops.

## Renovate

- Config: `renovate.json`
- Schedule: weekly, Monday before 6am America/Edmonton
- Auto-merges patch / minor for `@vvo/tzdb` and dev deps when CI passes
- Dependency Dashboard: see the pinned issue in the repo's Issues tab
- Major bumps require manual review

## IANA rule-change sync

- Workflow: `.github/workflows/sync-rule-changes.yml`
- Schedule: weekly, Monday 13:00 UTC; or manual via the Actions tab
- Pulls `https://data.iana.org/time-zones/tzdb/NEWS`, parses the last
  18 months of release notes, writes `public/rule-changes.json`,
  opens a PR labelled `timezone-data,automated`.
- The PR is **not auto-merged**. Decide per zone whether to lift the
  English snippet into `src/data/ruleChanges.js`'s `STATIC_RULE_CHANGES`
  with proper i18n, or merge as is and let the fallback handle it.

## Quick checks (5 min/week)

1. Open the Dependency Dashboard issue: ack any blocked upgrades.
2. Skim any open `chore/sync-rule-changes` PR; if no zone deserves a
   handcrafted message, click merge.
3. Cloudflare Pages auto-deploys main; nothing to do server-side.
```

### Step 10: Commit (split per concern for clean review)

```bash
# 1. Refactor ruleChanges + tests + locales (no automation yet)
git add src/data/ruleChanges.js src/data/ruleChanges.test.js \
        src/components/PolicyInfoIcon.jsx src/components/PolicyInfoIcon.test.jsx \
        src/locales/en.js src/locales/zh.js \
        public/rule-changes.json
git commit -m "refactor: split ruleChanges into static + dynamic layers"

# 2. Add the script + workflow + ops doc
git add scripts/sync-rule-changes.mjs .github/workflows/sync-rule-changes.yml \
        docs/operations/automated-maintenance.md
git commit -m "chore: add IANA rule-change auto-sync workflow"
```

---

## Risks & mitigations

| Risk | Mitigation |
|---|---|
| IANA changes the NEWS file URL or format | Script's regex is loose; if it returns 0 entries, the empty diff fails to open a PR (no harm). Manual fallback: edit `public/rule-changes.json` directly. |
| Renovate floods PRs after a quiet period | Weekly schedule + grouping (`@vvo/tzdb` and dev deps each get one PR) cap volume. |
| Auto-merge gates on a flaky CI | Adding the branch protection rule is optional; if disabled, Renovate still PRs but doesn't auto-merge until you click. |
| `fetch('/rule-changes.json')` fails in production | `loadRuleChanges` swallows errors and falls back to `STATIC_RULE_CHANGES`; PolicyInfoIcon stays functional for hand-curated zones. |
| Dynamic English description leaks into ZH UI | The `policy.fallbackPrefix` key is localised, but the snippet itself stays English. Acceptable for v1; if user feedback indicates otherwise, lift the zone into `STATIC_RULE_CHANGES` (which is exactly the human review step the PR invites). |

---

## Estimate

- **Task A**: ~15 min, 2 new files, ~30 LOC. Real work happens at next Monday's first Renovate run.
- **Task C**: ~1.5 hr, 1 refactor + 5 new files (script, workflow, public seed, ops doc, locale keys). Tests need ~3 new cases.

Total: a single half-day session.

---

## Out of scope

- Auto-fetching IANA tzdata at runtime (the browser already does this; replicating it in JS would be both heavy and redundant).
- Translating dynamic English descriptions automatically (LLM-in-CI is a possibility but not v1).
- Replacing `peter-evans/create-pull-request` with a self-hosted alternative (the action is widely used and well-maintained).
- Notifying via Telegram / Slack when a PR opens (cc-connect can do this, but skipping until volume justifies it).
