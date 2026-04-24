# K-Zone — UI/UX Design Brief

## Project Context

K-Zone is the first tool in **K-Tools**, a personal collection of lightweight web utilities. Each tool is standalone but will eventually live under the same website with a shared design language. This brief covers only the first tool.

---

## What It Does

A timezone utility with two distinct features on a single page, stacked vertically.

---

## Feature 1 — Reverse Timezone Lookup (top section)

**Core use case:** "It's 3am in Calgary right now. Which cities are currently at 5am?"

**Interaction flow:**

1. Page loads and auto-detects the user's timezone from the browser
2. A small prompt shows: "Detected: Calgary (MDT)" with an option to change it
3. User picks a **target time** (e.g. 5:00 AM) from a time picker
4. Optionally, user overrides the **reference date/time** via a datetime picker (defaults to now; a "Now" button resets it)
5. Results appear immediately: a list of cities/regions at that time on the reference date

**Result display should include:**
- City name and country
- The confirmed local time (e.g. "5:00 AM, Thursday")
- Timezone name (e.g. GMT+1)

**Why this feature is unique:** Most timezone tools are directional ("what time is it in Tokyo?"). This one works in reverse — you describe a time, it finds the places. Useful for scheduling calls without waking someone up, or finding colleagues who are at a reasonable hour.

---

## Feature 2 — Forward Timezone Lookup (bottom section)

**Core use case:** "I'm in Calgary. What time is it in Tokyo right now?"

**Interaction flow:**

1. Source city is pre-filled from the auto-detected timezone (same as above, shared state)
2. User picks a **target city** from a searchable dropdown
3. Optionally, user overrides the reference date/time (shares the same datetime picker state as Feature 1)
4. Result shows immediately: the local time in that city at the reference date/time

**Result display should include:**
- Current time in the target city
- Date (in case it's a different day)
- Timezone offset relative to the user (e.g. +15 hours)

---

## Shared Behaviors

- **Auto-detect timezone:** On page load, browser timezone is detected and used as the "my location" for both features. A visible label shows what was detected. Tapping/clicking it opens a dropdown to override.
- **City dropdown:** Uses the full IANA timezone database with human-readable city names (iOS-style). Popular/major cities (e.g. New York, London, Tokyo, Shanghai, Sydney) are sorted to the top. The rest follow alphabetically. Dropdown is searchable.
- **Live results:** No submit button. Results update as the user changes inputs.
- **DST awareness:** Handled automatically by the browser's native Intl API. No manual DST flags needed.
- **Date/time override:** A shared datetime picker lets users query hypothetical past or future moments. Defaults to now; a "Now" button resets it. The datetime is interpreted in the user's selected home timezone.
- **Favorites:** Users can star/bookmark any city from the results. Starred cities appear as a quick-access strip at the top of each section showing their live (or reference) time. Clicking a favorite pre-fills the relevant input.
- **History:** The last 10 unique lookups are auto-saved and shown as compact chips below the inputs. Clicking a chip restores that lookup.

---

## Layout

- Single scrollable page
- Two clearly separated sections, one above the other
- Section 1 (Reverse Lookup) is above the fold on desktop; users scroll to reach Section 2
- A subtle visual divider or spacing separates the two sections
- No tabs, no navigation — everything on one page

---

## Responsive Requirements

- **Mobile-first:** Most usage will be on phones (quick lookup while chatting)
- On mobile: full-width inputs, results in a stacked list
- On desktop: wider layout, inputs and results can use more horizontal space
- Minimum supported width: 320px

---

## Design Tone

- Clean and functional, no clutter
- This is a utility tool — clarity and speed of use matter more than decoration
- Should feel at home alongside future K-Tools (consistent design language for the collection)
- Dark mode support is desirable but not required for v1

---

## Tech Stack (for reference, not for Gemini to decide)

- Vite + React
- Vanilla CSS (no Tailwind or component libraries)
- @vvo/tzdb for city name data
- Cloudflare Pages for deployment

---

## What We Need from Gemini

A UI/UX design proposal covering:

1. Overall visual style and color palette
2. Layout wireframes for mobile and desktop
3. Component designs: city dropdown, time picker, result cards
4. How the "detected timezone" prompt looks and behaves
5. Visual separation between the two sections
6. How the date/time override control looks — placement, the "Now" reset button, and how it signals "you are viewing a hypothetical moment" vs. live mode
7. How favorites and history chips look — the star/bookmark affordance on result cards, the favorites strip at the top of each section, and the history chips below the inputs
8. Any UX improvements or suggestions beyond the spec above
