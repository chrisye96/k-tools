# K-Tools Deployment & Maintenance Playbook

Steps the human owner does once (or rarely). The codebase already ships
the configs / workflows; this file lists the GitHub UI / Cloudflare UI
clicks that wire them up.

---

## 1. Renovate (weekly automated dependency upgrades)

**Codebase ready:** `renovate.json`, `.github/workflows/ci.yml`.

**Do once on github.com:**

1. Go to https://github.com/apps/renovate and click **Configure**.
2. Pick the `k-tools` repository, then **Save**.
3. In the repo: **Settings → General → Pull Requests** → enable
   **Allow auto-merge**.
4. (Recommended) **Settings → Branches → Add rule** for `main`:
   - Branch name pattern: `main`
   - Enable **Require status checks to pass before merging**
   - Required check: **test** (the job from `.github/workflows/ci.yml`)
   - Save.

**What happens next:** Monday before 06:00 (America/Edmonton), Renovate
opens a Dependency Dashboard issue + one PR per group (`@vvo/tzdb`,
dev deps, lockfile maintenance). Patch + minor bumps for those groups
auto-merge after CI passes. Major bumps (e.g. `@vvo/tzdb 6 → 7`)
require manual review.

**Quick check (5 min/week):** scan the Dependency Dashboard issue,
ack any blocked upgrade.

---

## 2. IANA rule-change sync (weekly auto PR)

**Codebase ready:** `scripts/sync-rule-changes.mjs`,
`.github/workflows/sync-rule-changes.yml`,
`src/data/ruleChanges.js` (two-layer static + dynamic).

**Do once on github.com:**

1. **Settings → Actions → General → Workflow permissions** → set to
   **Read and write permissions** + check **Allow GitHub Actions to
   create and approve pull requests**.
2. (Optional) **Actions tab → Sync IANA rule changes → Run workflow**
   — fires the script immediately to verify the wiring.

**What happens next:** Monday 13:00 UTC, the workflow:

1. Fetches `https://data.iana.org/time-zones/tzdb/NEWS`.
2. Parses the last 18 months of release notes for IANA zone names.
3. Writes `public/rule-changes.json` and opens a PR labelled
   `timezone-data,automated`.

PRs are **not** auto-merged. Decide per zone:

- If a zone deserves a localised message: lift the entry into
  `STATIC_RULE_CHANGES` in `src/data/ruleChanges.js` and add i18n
  keys to `src/locales/en.js` + `zh.js`.
- Otherwise merge as is; the dynamic fallback prefixes the IANA
  English snippet with `policy.fallbackPrefix`.

---

## 3. Cloudflare Pages (auto-deploy on every push to main)

**Codebase ready:** `wrangler.toml`, `public/_headers`,
`public/_redirects`. CI already builds dist/ on every PR.

**Do once on https://dash.cloudflare.com:**

1. **Workers & Pages → Create → Pages → Connect to Git**.
2. Select the `k-tools` GitHub repository, click **Begin setup**.
3. Build configuration:
   - **Framework preset:** Vite
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** (leave blank)
   - **Environment variables:** none required for v1
4. Click **Save and Deploy**.

**What happens next:**

- Every push to `main` triggers a new deploy.
- Every PR triggers a Preview deploy at a unique URL.
- `_headers` makes `/assets/*` immutable for 1 year (Vite hashes
  filenames so this is safe) and forces `index.html` +
  `rule-changes.json` to revalidate, so weekly IANA syncs are picked
  up fast.
- `_redirects` keeps deep-link refreshes from 404'ing if K-Tools ever
  adds a client-side router.

**Custom domain (optional):**

1. Cloudflare dashboard → the new Pages project → **Custom domains →
   Set up a custom domain**.
2. Enter your domain (e.g. `k-zone.example.com`).
3. Cloudflare will create the CNAME automatically if the domain is
   registered with Cloudflare; otherwise add the CNAME at your DNS
   provider.

---

## 4. Quick weekly maintenance routine (5 minutes)

Every Monday morning:

1. **Renovate Dependency Dashboard** issue: ack anything blocked.
2. **chore/sync-rule-changes** PR (if any): merge as-is or pull a
   notable zone into `STATIC_RULE_CHANGES`.
3. **Cloudflare dashboard → Pages**: confirm latest deploy is green.

Anything outside these three is a real change request, not maintenance.

---

## 5. Monitoring

- **GitHub Actions tab**: each workflow run shows pass/fail. Failures
  email the repo owner via GitHub's default notification settings.
- **Cloudflare Pages → Deployments**: deploy history + logs per build.
- **Cloudflare Analytics → Web Analytics** (free): pageviews, visitors,
  geographic distribution. Enable per-domain in the Pages project
  settings.

---

## 6. Rollback procedure

**Bad deploy on Cloudflare:**

1. Cloudflare dashboard → Pages → the project → **Deployments**.
2. Find the last known-good deployment in the list.
3. Click the **⋯** → **Rollback to this deployment**.

**Bad commit on main:**

```bash
git revert <bad-sha>
git push
```

CI runs, Cloudflare deploys the revert automatically.

**Bad Renovate auto-merge:**

Same as bad commit: `git revert`, push. Renovate will not re-open the
same PR if the underlying upgrade is reverted (it tracks merged shas).
