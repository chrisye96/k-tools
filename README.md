# K-Zone

**English** | [简体中文](README.zh-CN.md) | [繁體中文](README.zh-TW.md)

Cross-timezone scheduling, solved in one screen. Live at **[kzone.chrisye.dev](https://kzone.chrisye.dev)**.

K-Zone answers the two questions every distributed team keeps asking:

- **Reverse lookup**: "The meeting is at 9 AM in Calgary. What time is that for everyone else?"
- **Forward lookup**: "I want everyone awake. Which time slots work across all our cities?"

## Features

- **Anchor mode**: pin one city as the reference point and read every other timezone against it
- **Live world clocks**: a glanceable board of the cities you care about, updating in real time
- **Fuzzy city search** backed by [@vvo/tzdb](https://github.com/vvo/tzdb) and [fuse.js](https://fusejs.io/), so "calgry" still finds Calgary
- **Date-aware conversion** with react-day-picker, handling DST transitions correctly
- **Bilingual UI**: English and 中文

## Stack

React 19 + Vite, Radix UI primitives, Vitest for tests, deployed on Cloudflare Pages via Wrangler.

## Development

```bash
npm install
npm run dev        # local dev server
npm run test       # vitest watch mode
npm run test:run   # single test pass
npm run build      # production build
```

## Deploy

Pushes deploy to Cloudflare Pages (see `wrangler.jsonc`).
