# K-Zone Design Spec
**Date:** 2026-04-24
**Project:** K-Tools (Tool #1)
**Status:** Approved — ready for implementation planning

---

## Overview

K-Zone is the first tool in K-Tools, a personal collection of lightweight web utilities. It solves a specific gap in existing timezone tools: the ability to work in reverse — given a target time, find which cities in the world are currently at that time.

The tool lives on a single page with two stacked sections. No navigation, no tabs, no page transitions.

---

## Architecture

**Tech stack:**
- Vite + React (no component library, no Tailwind)
- Vanilla CSS with CSS custom properties for theming (light + dark)
- `@vvo/tzdb` for city name to IANA timezone mapping
- `react-day-picker` for the calendar surface in the date/time override
- Browser `Intl` API for all timezone calculations
- Cloudflare Pages for deployment

**Project structure:**
```
k-tools/
  src/
    components/
      CitySelect.jsx          # shared searchable dropdown
      TimezoneBadge.jsx       # "Detected: Calgary" pill + override
      PolicyInfoIcon.jsx      # contextual DST rule-change icon next to the badge
      FavoritesList.jsx       # pinned cities quick-access strip (per section)
      ThemeToggle.jsx         # round icon button (light <-> dark)
      LanguageSelect.jsx      # native <select> for EN / ZH
      TimeTravelBanner.jsx    # banner shell, opens the picker, shows reset
      DateTimePicker.jsx      # decoupled picker (react-day-picker + time grid)
      TrustFooter.jsx         # "Timezone Data: IANA <version>" footer
    contexts/
      ThemeContext.jsx        # theme provider + useTheme hook
      LanguageContext.jsx     # locale provider + useT hook
    locales/
      en.js                   # English string dictionary
      zh.js                   # Chinese string dictionary
    features/
      reverse/
        ReverseSearch.jsx
        ReverseResults.jsx
      forward/
        ForwardSearch.jsx
        ForwardResult.jsx
    data/
      cities.js               # processed @vvo/tzdb export, popular cities first
    utils/
      timezone.js             # Intl API wrappers
      useFavorites.js         # localStorage favorites hook
      useHistory.js           # localStorage recent lookups hook
    App.jsx
    main.jsx
    styles/
      global.css
      variables.css           # dual-theme tokens (light + [data-theme="dark"])
  index.html
  vite.config.js
```

**Shared state:** Lifted to `App`:
- `homeTimezone` — detected/selected base timezone, drives both features
- `referenceDate` — null means live; non-null means time-travel mode
- `pickerOpen` — boolean controlling the root-level `DateTimePicker` overlay
- `theme`, `language` — provided via `ThemeContext` / `LanguageContext`, persisted to localStorage

---

## Design Tokens & Theming

The full visual system (palette, typography scale, iOS Inset Grouped card style, tabular-nums for the large time, spacing, radius) lives in `docs/K-Zone-Design-System.md`. `src/styles/variables.css` materialises that document into two CSS variable sets: defaults under `:root` (light) and overrides under `[data-theme="dark"]`.

**Brand accent:** Teal `#30B0C7` (light) / `#4DD0E1` (dark). Used as the only interactive-focus colour.

**Surface model:** No borders. Layering is communicated by background contrast between page (`--color-bg`) and card (`--color-surface`).

**Numeric type:** All live time displays use `font-variant-numeric: tabular-nums` to prevent width jumps on second/minute changes.

---

## Theme & Language

Both controls live in the top navigation bar, on the right, as two independent components.

### Theme

- A round icon button (`ThemeToggle`) flips between light and dark
- Initial value: read from `localStorage.kzone-theme`; if absent, fall back to `window.matchMedia('(prefers-color-scheme: dark)')`
- On change: write `data-theme` on `<html>`, persist to localStorage
- No "system / auto" tri-state in v1 — keep the toggle binary; the OS preference only seeds the first visit

### Language

- A native `<select>` (`LanguageSelect`) with two options: `EN`, `ZH`
- Native `<select>` is intentional: zero accessibility work, native mobile picker on iOS/Android, easy to extend to more locales later
- Initial value: `localStorage.kzone-language` ?? `navigator.language.startsWith('zh') ? 'zh' : 'en'`
- All UI strings live in `src/locales/en.js` and `src/locales/zh.js`. A `useT()` hook returns a `t(key)` function from `LanguageContext`. No hardcoded English in components.

The two controls do not share a parent component or a settings drawer; they are siblings in the top nav.

---

## Feature 1 — Search by Time (reverse lookup)

**Position:** Top section, above the fold on desktop.

**Use case:** "It's 3am in Calgary. Which cities are currently at 5am?"

### User flow

1. Page load: browser timezone auto-detected via `Intl.DateTimeFormat().resolvedOptions().timeZone`
2. A `TimezoneBadge` shows: "Your location: Calgary (MDT) ↓" — clicking opens the city dropdown to override
3. User selects a target time from a time input (HH:MM, 12h or 24h based on browser locale)
4. Optionally, user overrides the reference date/time via a datetime picker (defaults to now; a "Now" button resets it)
5. Results render immediately (no submit button) — a list of all cities at the target time on the reference date

### Results

Each result row shows:
- City name and country
- Current local time (confirmed, e.g. "5:00 AM")
- Day label if different from user's day (e.g. "Thursday")
- UTC offset (e.g. "UTC+1")

Results are grouped by UTC offset when multiple cities share the same timezone. If no cities match (edge case with rare offsets), show: "No major cities found for this time."

### Calculation logic

```
offsetDiff = targetHour - currentHourInUserTZ
matchingTZ = timezones where (currentUTCHour + tzOffsetHours) % 24 === targetHour
```

Uses `Intl.DateTimeFormat` with each candidate timezone to get the current hour — no manual DST math needed.

---

## Feature 2 — Search by City (forward lookup)

**Position:** Bottom section, below Feature 1.

**Use case:** "I'm in Calgary. What time is it in Tokyo right now?"

### User flow

1. Source timezone pre-filled from shared detected/selected timezone (same as Feature 1)
2. User selects a target city from the searchable `CitySelect` dropdown
3. Optionally, user picks a reference date/time (shares the same datetime picker state as Feature 1; defaults to now)
4. Result updates immediately

### Result

- Current time in the target city (large, prominent)
- Date if different from user's local date
- UTC offset
- Offset relative to user's timezone (e.g. "+15 hours")

---

## Shared Components

### CitySelect (searchable dropdown)

- Full IANA timezone library via `@vvo/tzdb`
- City display format: "Tokyo, Japan" not "Asia/Tokyo"
- Sorting: ~80 popular cities first (grouped, visually separated), then full alphabetical list
- Search: filters across city name and country in real time
- Keyboard navigable (accessibility requirement)

### TimezoneBadge

- Compact pill/badge showing the currently selected "home" timezone
- Click to open CitySelect in override mode
- If auto-detection fails (rare), opens CitySelect immediately on load with a prompt: "Select your timezone"

### PolicyInfoIcon

- A small `ℹ️` icon rendered next to the `TimezoneBadge` only when the active home timezone has had a recent IANA rule change (DST cancellation, offset shift, etc.)
- Click opens a lightweight alert/toast explaining the change and confirming the tool uses the latest rules
- v1 ships with a hardcoded list of recently-changed zones (Calgary / America/Edmonton being the canonical example); the lookup is wrapped in a `hasRecentRuleChange(timezone)` helper so the data source can be swapped later without touching the component

---

## Date and Time Override

Both sections share a single `referenceDate` state lifted to `App`. Default is `null` (meaning "use current time at render"). The override is delivered through a three-layer decoupled architecture instead of a native `<input type="datetime-local">`.

### Three-layer decoupling

**Layer 1 — `TimeTravelBanner`** (per section, presentation only)
- Sits between the inputs and the results within each feature section
- Two visual states driven by `referenceDate`:
  - Inactive: a single muted Teal line `+ Set Date/Time (Time Travel)`
  - Active: full-width banner with `--teal-light` background, `⚠️ Showing results for: <localised date>` plus a `↻ Reset to Live` action on the right
- Props: `{ referenceDate, onOpen, onReset }`. Knows nothing about the picker implementation — clicking the banner calls `onOpen()`

**Layer 2 — `DateTimePicker`** (single instance, root-level)
- Built on `react-day-picker` (calendar grid) plus a custom 24-row time grid (hour + minute steps in 5-minute increments)
- Props: `{ open, value, timezone, onChange, onClose }`
- Renders as a bottom sheet on mobile (< 640px) and a centred popover on desktop, both styled with the project's CSS variables
- Outputs a `Date` object interpreted in the active `homeTimezone`; never reads or writes localStorage itself
- Mounted once at the root of `App` so its overlay z-index and positioning are independent of any section's layout

**Layer 3 — `App.jsx`** (state owner)
- Holds `referenceDate` (shared with both sections) and `pickerOpen` (controls the picker overlay)
- Both `TimeTravelBanner` instances call up through `onOpen` to set `pickerOpen = true`
- `DateTimePicker` calls `onChange(date)` to update `referenceDate`; reset comes from the banner's `onReset` which sets `referenceDate = null`

This split keeps the banner's iOS-style visual language separate from the picker's mechanics, lets us swap the picker implementation later without touching either feature section, and avoids two competing picker instances when both sections are open.

**Impact on calculations:**
- `findCitiesAtHour(cities, targetHour, referenceDate ?? new Date())` — reverse lookup passes the reference date
- `formatTimeInTimezone(city.timezone, referenceDate ?? new Date())` — forward lookup passes the reference date

---

## Favorites and History

Both features are stored in `localStorage`, no backend required.

### Favorites

- User can star any city from reverse lookup results or the forward lookup result via a simple star button (`⭐` toggle) on each result row. No swipe gesture in v1; star buttons are keyboard-focusable and screen-reader friendly.
- Starred cities are stored in `localStorage` under `kzone-favorites` as an array of IANA timezone strings
- A `FavoritesList` strip renders at the top of **each section** (per-section partition, not a single global strip), showing pinned cities with their live or reference time. Both strips read the same `favorites` array but render in their own section's context.
- Clicking a favorite city in the reverse section pre-fills the target time to match that city's current hour; in the forward section it selects that city as the target

### History

- The last 10 unique lookups are stored in `localStorage` under `kzone-history`
- A history entry records: `{ type: 'reverse' | 'forward', timezone, targetHour?, timestamp }`
- History is shown as compact chips below the inputs; clicking a chip restores that lookup
- History is appended automatically on every result change (debounced to 1 second to avoid thrashing)

---

## Responsive Behavior

Three breakpoints, all driven by viewport width:

**Mobile (< 640px):**
- Full-width inputs stacked vertically; results in a single-column list
- `CitySelect` opens as a full-screen overlay with large tap targets
- `DateTimePicker` opens as a bottom sheet
- Favorites strip scrolls horizontally with `scroll-snap`

**Tablet / narrow desktop (640–959px):**
- Single column, but with comfortable max-width and side padding
- `CitySelect` and `DateTimePicker` open as popovers
- Section cards reach a max-width of ~600px, centred

**Wide desktop (≥ 960px):**
- Two-column layout inside each section: inputs on the left, results on the right
- Both feature sections still stacked vertically (no side-by-side sections)
- `CitySelect` and `DateTimePicker` continue as popovers anchored to their triggers

**Minimum supported width:** 320px

---

## Error Handling

| Scenario | Behavior |
|---|---|
| Timezone auto-detect fails | Show "Select your timezone" prompt, open CitySelect |
| No cities match target time | Show "No major cities found for this time" |
| `@vvo/tzdb` data fails to load | Show inline error, disable dropdowns |
| Browser does not support `Intl` | Show a static notice: "Your browser is too old for this tool" |

---

## Data: City List

Source: `@vvo/tzdb` — provides IANA timezone IDs with human-readable city names and country codes, kept in sync with the IANA tzdata release cycle.

**Popular cities (sorted first, ~80 cities):**
New York, Los Angeles, Chicago, Toronto, Vancouver, Calgary, London, Paris, Berlin, Madrid, Rome, Amsterdam, Zurich, Stockholm, Moscow, Dubai, Mumbai, Delhi, Kolkata, Bangkok, Singapore, Hong Kong, Shanghai, Beijing, Tokyo, Seoul, Sydney, Melbourne, Auckland, São Paulo, Buenos Aires, Mexico City, Cairo, Lagos, Nairobi, Johannesburg — plus others covering all major UTC offsets.

**Processing:** `cities.js` imports from `@vvo/tzdb`, marks popular cities with a flag, and exports a sorted array: popular first, then remaining by city name alphabetically.

---

## DST and Timezone Updates

All timezone math is delegated to the browser's `Intl` API. DST transitions (including edge cases like Alberta's announced permanent DST trial) are handled automatically when the browser updates its built-in IANA database. No code changes or redeployments needed on our side.

### Contextual rule-change notice

When the active home timezone matches a recently-changed zone (initially a small hardcoded set, e.g. `America/Edmonton` for Alberta's DST update), `PolicyInfoIcon` renders next to `TimezoneBadge`. Clicking the icon shows a localised one-paragraph explanation through the language dictionary (`t('policy.albertaDst')` etc.), reassuring the user that calculations already use the latest IANA data. The check is encapsulated so the rule list can later be loaded from a remote source.

---

## Trust Footer

A small `TrustFooter` component renders at the very bottom of the page, centred, in `--color-text-secondary`:

```
Timezone Data: IANA <version> (Up to date)
```

The version string is read from `@vvo/tzdb`'s package metadata at build time (or import time). The "Up to date" suffix is static copy in v1; if we later wire up a freshness check, only this component changes.

---

## K-Tools Integration (Future)

K-Zone is designed as a standalone page now, but the CSS custom properties (`--color-bg`, `--color-accent`, `--font-body`, spacing scale, etc.) defined in `variables.css` will form the shared design token foundation for future K-Tools. When a second tool is added, the project structure expands to a multi-route app with a shared header/nav.

For now: no header, no nav, just the tool.

---

## Out of Scope (v1)

- Map visualization
- Backend / API calls
- Sharing or exporting results
- Locales beyond EN / ZH
- Tri-state theme (Light / Dark / System) — v1 is binary toggle, OS preference seeds the first visit only
- Remote-loaded DST rule-change list (v1 uses a small hardcoded set behind a helper)
