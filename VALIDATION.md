# Swamp Signal implementation and design review

Status: **Complete for the stated repository scope**, with the verification limitations below. This is the worker's evidence record, not independent certification or a claim of complete WCAG compliance.

## Scope and assumptions

The deliverable is a static React/TypeScript/Vite website about IdentityMD tweets, with a dark green visual system and original AI-equipped Pepe artwork. The one-page app provides feed/saved navigation, search, topic and date filters, ranking, complete-text expansion, pagination, local bookmarks, original links, copy feedback, and a source/ranking dialog.

No credentials or tweet list were supplied. Public sources were available, so the useful result is a clearly identified October 16, 2026 snapshot of 12 real posts from five accounts. “Top” is explicitly likes within this collection, not a claim to index all of X. It is not a simulated live feed. Public account pages and FxTwitter provided exact post text and recorded counts; author claims were not independently verified. Sources are in `docs/feed-sources.json` and the full runtime data is in `src/data/posts.json`.

English and the requested dark theme are the implemented variants. Wallet connections, shared accounts, live refresh, backend submission, inline video playback, transactions, and hosting are outside the requested scope. No secrets, private endpoints, or owner-settable identifiers are required.

## Acceptance coverage

| Requirement | Result and evidence |
| --- | --- |
| Website showing top tweets about IdentityMD | Met: sourced posts, real attribution and original links; explicit snapshot and ranking disclosure |
| “dark green with a theme of pepes armed with AI” | Met: dark green tokens and original vector Pepes with AI blaster, terminal, and drone |
| Usable interactions and responsive layouts | Met in tested Chromium flows; 15 interaction checks pass; see browser limits |
| `dist/index.html`, assets, source, lockfile, relative asset URLs | Prepared together for submission; 22 export files; clean-lockfile rebuild matches every export byte; gateway-style `/preview/` tested |
| Production build, typecheck, useful interaction validation recorded | Met: actual commands/results below and machine-readable records in `docs/` |
| Pinned Better Interface applied, six-domain review, fixes recorded | Met: all six core sections read; construction choices, coverage, and reproduced fixes recorded here |
| Product and main action in the first 390px screen; metadata | Met at 390 × 844: title, feed, search, filters, first post and original-post link visible; title/favicon/description/og:title/og:image present |
| Root `DESIGN.md` describing the final source | Met: source-derived colors, typography, spacing, components, breakpoints, and limits |
| README install/preview/rebuild instructions | Met: `npm ci`, development, production preview, rebuild, and validation instructions |

The assignment forms the Git submission from these delivered files. No Git metadata or ignore file was changed. Validation records and screenshots also live under `docs/` so the repository documentation does not depend on the separately collected, Git-ignored `artifacts/` directory.

## Six-domain coverage

| Domain | Checked | Evidence and limits |
| --- | --- | --- |
| Accessibility | Native links/buttons/selects, labels, heading/landmark order, skip link, pressed states, modal focus cycling/return, Escape, focus ring, polite updates, storage/copy fallbacks, reduced motion | Production keyboard interaction; screenshot `docs/screenshots/keyboard-focus.png`; axe on feed and dialog found no tested A/AA violations. Native screen-reader testing unperformed. Probe: all 47 controls at 390 satisfy 24px-or-spacing; 35 are below the 44px comfort recommendation. |
| Layout | Product/action above fold at 390, shared edges, one/two-column feed, compact phone selectors, image/description separation, long text, empty/saved states, 200% text enlargement | Rendered at 320, 390, 680, 900, 1160, 1440px; no page overflow. Probe found no text overlap, clipping, or floating controls over text. Native browser zoom and RTL unperformed. |
| Writing | Main action labels, consistent “post”/“saved”, recoverable empty/error text, fixed snapshot disclosure, local-only save destination, honest media labels | `src/App.tsx`, `src/components/PostCard.tsx`; external action names identify X; no fake live counters, fabricated posts, sign-in form, or unwired buttons. Quotes retain their authors’ wording. |
| Typography | One local family, three weights, six-token scale, body line height, full-text disclosure, natural casing/tracking, tabular counts, wrapping | Probe found five total sizes on each default viewport and one resolved family; local WOFF2 request succeeded. Long text expands and root font enlargement to 32px passed. Font synthesis across every fallback OS was not tested. |
| Colors | Semantic roles, dark theme consistency, static/selected/focus cues, actual solid-background contrast | Probe passed measured text pairs. Examples: post text 14.77:1; muted feed context 7.28:1; primary-button label 11.99:1. Five image-backed text boxes were outside the probe’s measurement coverage. Full forced-colors visual review unperformed; source override exists. |
| UI | Card and control states, consistent icons, real metrics versus actions, empty/recovery behavior, pagination, storage failure, copy failure, dialog, motion restraint | Interactions checked on the production export. Source review covered hover and active styles. No `transition: all`, no continuous animation, no autoplay. Ten-percent-speed animation inspection is not applicable to this app’s absence of staged animation; physical touch behavior unperformed. |

The writing/typography choices keep a five-word headline paired with a plain product description. The visual idea is a sourced IdentityMD feed with AI-equipped Pepe field scouts; no additional promotional sections precede the product.

## Findings fixed and rechecked

All references below point to the final source, not minified assets.

### 1. High · Mobile artwork crossed the product description

- Source: `src/styles.css:425`, phone overrides under `src/styles.css:1080`.
- Observed: the initial 390 × 844 screenshot showed the illustration covering the end of the first description line.
- Fix: constrain and position the phone illustration within the title region; give the description a full-width line below it. The image is 145px at 390 and 120px below 370.
- Why: the product explanation must remain readable on the first phone screen.
- Recheck: final 390 and 320 screenshots viewed; offline probe found zero text overlap/overflow.

### 2. Medium · Original-post action was too far down the phone card

- Source: `src/components/PostCard.tsx:81` (`.post-date` anchor).
- Observed: initial phone cards placed the explicit open action below a media preview.
- Fix: make the date/X area a real, named original-post link while preserving the conventional footer action.
- Why: the reader can reach the original without scrolling past the entire first card.
- Recheck: automated bounding-box assertion puts the original-post link fully within the 390 × 844 viewport; visually confirmed in `docs/screenshots/mobile-390.png`.

### 3. High · Backward Tab escaped the dialog controls

- Source: `src/App.tsx:599` (`onKeyDown`).
- Observed: after opening the source dialog and pressing Shift+Tab from the first control, the initial Chromium test found focus outside the dialog.
- Fix: explicitly cycle first/last enabled visible controls for Tab and Shift+Tab, retaining native modal semantics and Escape handling.
- Why: keyboard focus must stay in the active modal and return to the opener on dismissal.
- Recheck: the test passes for initial focus, backward cycling, Escape, and focus return. The supplied browser tool also opened/dismissed the modal.

### 4. High · Enlarged sort labels overflowed

- Source: `src/styles.css:504` (`.sort-group`).
- Observed: a 32px root font at 390px caused the third sort control to extend outside the page.
- Fix: allow the sort group to wrap while preserving its native buttons and labels.
- Why: controls must remain reachable with enlarged text.
- Recheck: 200% text-enlargement test and ordinary responsive checks pass. This evidence does not substitute for native browser zoom.

### 5. Medium · Attachment description did not match the retrieved image

- Source: `src/components/PostCard.tsx:199` (`mediaAlt`).
- Observed: the retrieved image on Adam’s protocol-update post is a table of jobs; its first description incorrectly suggested Pepe artwork.
- Fix: describe the actual table of completed, blocked, and running swarm jobs.
- Why: informative image alternatives must describe the content actually present.
- Recheck: inspected the downloaded image and final card; corrected source description retained in export.

### 6. Low · 320px controls consumed unnecessary vertical space

- Source: `src/styles.css:1269` and `src/App.tsx:379`.
- Observed: the narrow header, sort group, date selectors, and heading wrapped into several avoidable rows.
- Fix: reuse the caption step for small-screen brand/sort labels, remove redundant select icons and “Snapshot” prefix at this width, and keep the complete date.
- Why: preserve the first-screen feed area without hiding controls or changing the type scale.
- Recheck: `docs/screenshots/mobile-320.png` shows compact controls and the first post with its source link; 320px overflow check passes.

No unresolved reproduced high or medium implementation defect remains in the tested scope.

## Commands and actual results

The repository had no starter application. Runtime dependencies are React 19.2.0 and React DOM 19.2.0; Vite 7.1.12 and TypeScript 5.9.3 build the application. Dependencies and check scaffolding were installed outside the repository to honor the repository dependency-directory restriction.

Final clean installation and production checks, run against the exact source/configuration/lockfile copy in `/tmp/imd-release-check`:

```sh
npm ci --prefix /tmp/imd-release-check --cache /tmp/imd-npm-cache --no-audit --no-fund
cd /tmp/imd-release-check
npm run typecheck
npm run build
```

All exited 0. The final build transformed 33 modules. Output: HTML 1.61 kB, CSS 20.25 kB (4.63 kB gzip), JS 225.65 kB (70.89 kB gzip), plus local public assets. A SHA-256 comparison of every exported file found the clean-lockfile build identical to the delivered `dist/` (22 files).

Production interaction runner, executed from the repository against its export:

```sh
PLAYWRIGHT_MODULE=/tmp/imd-site-tools/node_modules/playwright/index.mjs \
AXE_MODULE=/tmp/imd-site-tools/node_modules/@axe-core/playwright/dist/index.mjs \
PLAYWRIGHT_BROWSERS_PATH=/tmp/imd-playwright-browsers \
node scripts/validate.mjs
```

Exit 0; **15/15 Chromium checks passed**. The script tests the static export under `/preview/`, blocks external network requests, and closes its browser/server. It exercises actual DOM interactions and compares ranking with the sourced collection. Clipboard denial/success are deliberately simulated to test both UI branches; native OS clipboard access was not independently tested. Local storage corruption and write denial are deliberately exercised. Search, topics, dates, sorting, load more, full text, persistence, saved removal, empty recovery, modal/keyboard focus, metadata/assets, six widths, text enlargement, and axe all pass. No application console error, resource failure, or external asset request was recorded.

The supplied browser tool additionally exercised the export at `/preview/`: search `oracle` returned two posts; clearing restored the feed; saving the first post and opening Saved produced one saved card; Escape dismissed the source dialog. Its final console contained zero warnings/errors and its listed local requests returned 200.

Pinned probe, run from the repository after the final source build:

```sh
IMD_PLAYWRIGHT=/tmp/imd-site-tools/node_modules/playwright/index.mjs \
PLAYWRIGHT_BROWSERS_PATH=/tmp/imd-playwright-browsers \
node .imd/reads/skills/design-critic/scripts/taste.mjs --out test/scratch/taste --offline
```

Exit 0; **16/16 checks passed**: render, layout, targets, contrast, casing, tracking, eyebrows, type-sizes, type-faces, glyphs, slogans, repetition, copy-budget, chrome, motion, and share. The first phone screen contained 15 measured prose words, below the 60-word threshold. The temporary probe output was saved in the assignment-approved scratch area; the persistent result is `docs/taste-results.json`. The pinned probe itself is an assignment input and is not redistributed.

## Evidence and remaining limitations

- `docs/interaction-results.json`: final interaction checks and explicit WebKit limitation.
- `docs/accessibility-results.json`: empty violation list for the tested feed scan; dialog scan also passed in the runner.
- `docs/taste-results.json`: final probe results, thresholds, errors, and external requests.
- `docs/feed-sources.json`: exact quoted text and retrieval records.
- `docs/screenshots/desktop-1440.png`, `mobile-390.png`, `mobile-320.png`: final export screenshots, visually inspected.
- `docs/screenshots/keyboard-focus.png`: rendered focus indicator, visually inspected.

WebKit downloaded but could not launch: the runtime reported missing host libraries including `libgstreamer-1.0.so.0` and `libgtk-4.so.1`. Safari/WebKit behavior is therefore **unverified**, not passed. Native screen readers, physical devices, native 200% zoom, RTL localization, and a full forced-colors visual pass were not performed. The probe cannot establish contrast for all image-backed text. Compact control comfort is below 44px in several cases, though measured baseline target/spacing checks passed.

X destinations and local link construction were checked; future X availability, sign-in requirements, and author edits/deletions remain outside this static snapshot. The site does not refresh its data or synchronize bookmarks. Those limits are disclosed in the interface and README.

## Packaging

The final static export contains 22 files totaling 855,181 bytes (about 0.82 MiB). Source, export, lockfile, documentation, licenses, and retained evidence together occupy less than 2.2 MiB as uncompressed Git submission candidates, below the 8 MiB bundle limit. No `node_modules`, package caches, dependency archives, symlinks/submodules, environment files, or prohibited configuration paths are included. No ignore file changed. Original/source media paths and relative export asset paths were checked for completeness. A formatter’s empty cache directories were removed before the final inventory.

The final 320px saved-empty state was also inspected using the supplied browser tool: no horizontal overflow, visible explanation, and a working “Explore top tweets” recovery control. Exact export hashes and the final byte inventory are recorded in the separately collected `artifacts/export-integrity.json`.
