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
- Vanilla CSS with CSS custom properties for theming
- `@vvo/tzdb` for city name to IANA timezone mapping
- Browser `Intl` API for all timezone calculations
- Cloudflare Pages for deployment

**Project structure:**
```
k-tools/
  src/
    components/
      CitySelect.jsx       # shared searchable dropdown
      TimezoneBadge.jsx    # "Detected: Calgary" prompt
    features/
      reverse/
        ReverseSearch.jsx
        ReverseResults.jsx
      forward/
        ForwardSearch.jsx
        ForwardResult.jsx
    data/
      cities.js            # processed @vvo/tzdb export, popular cities first
    utils/
      timezone.js          # Intl API wrappers
    App.jsx
    main.jsx
    styles/
      global.css
      variables.css
  index.html
  vite.config.js
```

**Shared state:** The user's detected/selected timezone is lifted to `App` level and shared across both features. Changing it in one section updates the other.

---

## Feature 1 — Reverse Timezone Lookup

**Position:** Top section, above the fold on desktop.

**Use case:** "It's 3am in Calgary. Which cities are currently at 5am?"

### User flow

1. Page load: browser timezone auto-detected via `Intl.DateTimeFormat().resolvedOptions().timeZone`
2. A `TimezoneBadge` shows: "Your location: Calgary (MDT) ↓" — clicking opens the city dropdown to override
3. User selects a target time from a time input (HH:MM, 12h or 24h based on browser locale)
4. Results render immediately (no submit button) — a list of all cities currently at the target time

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

## Feature 2 — Forward Timezone Lookup

**Position:** Bottom section, below Feature 1.

**Use case:** "I'm in Calgary. What time is it in Tokyo right now?"

### User flow

1. Source timezone pre-filled from shared detected/selected timezone (same as Feature 1)
2. User selects a target city from the searchable `CitySelect` dropdown
3. Result updates immediately

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

---

## Responsive Behavior

**Mobile (< 640px):**
- Full-width inputs stacked vertically
- Results in a single-column list
- CitySelect opens as a full-screen overlay with large tap targets

**Desktop (≥ 640px):**
- Inputs and results can use a two-column layout within each section
- CitySelect opens as a standard dropdown below the trigger

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

---

## K-Tools Integration (Future)

K-Zone is designed as a standalone page now, but the CSS custom properties (`--color-bg`, `--color-accent`, `--font-body`, spacing scale, etc.) defined in `variables.css` will form the shared design token foundation for future K-Tools. When a second tool is added, the project structure expands to a multi-route app with a shared header/nav.

For now: no header, no nav, just the tool.

---

## Out of Scope (v1)

- Date picker (only current time, not hypothetical past/future)
- Map visualization
- Saved favorites or history
- Dark mode (desirable but deferred)
- Backend / API calls
