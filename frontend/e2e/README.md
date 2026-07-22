# End-to-end (browser) verification

Playwright smoke tests that drive the deployed Ignet UI in a real browser.

## Why these hit a deployed site

Ignet's data comes from the live Flask API (there is no local database), so a
locally-served frontend cannot render a real network. These tests therefore run
against a deployed site, defaulting to the production URL. Point them elsewhere
with `E2E_BASE_URL`:

```bash
E2E_BASE_URL=https://staging.example.org/ignet npm run e2e
```

## Running

```bash
npm run e2e          # headless
npm run e2e:headed   # watch in a browser
```

First run downloads the Playwright chromium build (`npx playwright install
chromium`, run automatically by `npm ci` via the `postinstall` note below, or
run it once by hand).

## What they cover

- **Entity toggles** — the knob (an absolutely-positioned span) must stay inside
  its track in both ON and OFF states. This is a regression guard: an earlier
  `shrink-0` fix addressed the track width but not the knob, and the ON-state
  knob escaped the track and covered its label's first character (`Drugs` →
  `Jrugs`). A DOM gap measurement between two boxes did not catch it; measuring
  the knob against the track and the label does.
- **Entity categories** — Drugs / Diseases / Vaccines / INO / CoV / Gene-ontology
  controls are present.
- **Gene-ontology overlay** — loads on demand, reports the annotated-paper
  denominator, and changes the edge count (real co-occurrence edges replacing
  the decorative default ones).
- **INO on demand** — INO defaults off and loads only when toggled.

Each test asserts zero console errors where practical.
