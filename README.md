# Swamp Signal

A dark green, Pepe-themed reader for top tweets about IdentityMD. The site includes search, topic and date filters, three ranking modes, expandable posts, local bookmarks, copyable original links, and responsive layouts. Original vector artwork depicts two Pepes equipped with an AI blaster, a terminal, and a scout drone.

The ready-to-serve production website is in **`dist/`**. Source, the npm lockfile, fonts, images, favicon, and sharing card are included. No backend, wallet, API key, or runtime CDN is required.

## Install, run, and rebuild

Use Node.js 22.12+ or 24 and npm. This delivery was built with Node 24.9.0 and npm 11.6.0.

```sh
npm ci
npm run dev
```

To check and rebuild the production export:

```sh
npm run typecheck
npm run build
npm run preview
```

Vite prints the preview address, normally `http://localhost:4173`. Serve `dist/` over HTTP; opening an ES-module application directly with `file://` is not supported. Vite uses `base: './'`, and navigation uses `#feed` and `#saved`, so a static host needs no rewrite rules. The export was tested at `/preview/` to exercise gateway-style subpath hosting.

Keep the complete `dist/` folder with the source and lockfile when preparing a new submission. Dependency directories, caches, and browser downloads are not delivery files. No ignore file was added or changed in this assignment.

## What the feed contains

This is a **dated snapshot**, not a live or exhaustive X index: 12 public posts from five accounts, retrieved on October 16, 2026. Original text, attribution, dates, and recorded engagement come from public X pages and FxTwitter. The exact quotations and retrieval URLs are recorded in [docs/feed-sources.json](docs/feed-sources.json).

- **Top** sorts the collection by recorded likes, then reposts.
- **Latest** sorts by publication time; **Most reposted** sorts by recorded reposts, then likes.
- **Past 7 days** and **Past 30 days** end at the fixed snapshot timestamp in `src/data/feed.ts`. The initial seven-day view contains eight posts; six render initially, with a working “Show more” control.
- Search matches all entered words against author, handle, complete post text, and assigned topics. Topics are editorial labels, not popularity measurements.
- **Memes** selects all dates so the two collected meme posts are discoverable.
- Bookmarks use `localStorage` under `swamp-signal:saved`. They stay on that browser/device and do not change X. If storage is unavailable, the interface explicitly switches to visit-only saves.
- Counts are read-only snapshots. Video/GIF previews open X; the site does not embed or autoplay videos. Original posts and profiles may require X sign-in.

To refresh the collection, verify original post URLs and text, update `src/data/posts.json`, update the snapshot timestamp and displayed date in `src/data/feed.ts` and `src/App.tsx`, refresh the source record and necessary local media, then rebuild and validate. Do not put X credentials in this static site. Statements in quoted posts remain their authors’ claims.

## Validation

```sh
npx playwright install chromium webkit
npm run test:interactions
```

The interaction script creates and closes its own static server, blocks external requests, tests the production export, and writes its report and screenshots to `/tmp/swamp-signal-validation` by default. Set `VALIDATION_OUT` to choose another output directory. `SKIP_WEBKIT=1` skips that optional browser explicitly. A missing WebKit runtime is recorded as an unperformed check; Chromium test failures return a nonzero exit status.

Actual final results:

| Check | Result |
| --- | --- |
| Clean `npm ci`, `npm run typecheck`, `npm run build` | Passed; the clean-lockfile build matches the delivered export byte for byte |
| Production Chromium interaction checks | 15/15 passed |
| Accessibility scan of feed and modal | No violations in the tested WCAG A/AA rules |
| Pinned taste@1 probe, offline | 16/16 passed |
| Reflow | No page overflow at 320, 390, 680, 900, 1160, or 1440 CSS pixels |
| First screen at 390 × 844 | Product, search, filters, first post, and original-post link visible |
| Text enlargement | 200% root font size passed; this is not browser-native zoom |
| Console/resources | No application errors, failed resources, or external asset requests in the automated run |
| WebKit | Could not launch because host libraries, including GStreamer and GTK, were unavailable |

Build dependencies and browser downloads were installed in `/tmp` for this assignment. Production commands ran against an exact isolated copy of the source and lockfile; no repository dependency or cache directory is included. The supplied browser tool also exercised search, saving, saved navigation, and modal dismissal on the production export.

See [the six-domain review and limitations](VALIDATION.md), [interaction results](docs/interaction-results.json), [probe results](docs/taste-results.json), and [DESIGN.md](DESIGN.md). Native screen-reader, physical-device, native zoom, and Safari/WebKit verification remain unperformed. These are worker-side results, not independent certification.

## Files

- `src/App.tsx`: page composition, navigation, filters, storage, notifications, and source dialog.
- `src/components/PostCard.tsx`: attributed post text, previews, metrics, save/copy/open actions.
- `src/data/posts.json` and `src/data/feed.ts`: sourced snapshot and filtering/ranking.
- `src/styles.css`: tokens, components, focus, motion, and responsive rules.
- `public/`: local art, media, font/license, favicon, and sharing card. `social.svg` is the editable source for the shipped `social.png`.
- `scripts/validate.mjs`: production interaction and accessibility checks.
- `docs/`: source records, validation results, and final screenshots included with the repository.
- `artifacts/`: copies for the assignment’s separate artifact collection.

[Desktop preview](docs/screenshots/desktop-1440.png) · [390px preview](docs/screenshots/mobile-390.png) · [320px preview](docs/screenshots/mobile-320.png)

See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for attribution.
