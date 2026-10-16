# Swamp Signal design

## Overview

Swamp Signal is a reader for the IdentityMD community. Its defining visual idea is a quiet, dark green feed guarded by Pepes equipped with AI tools. The original `public/images/swamp-crew.svg` and frog favicon carry that identity; restrained surfaces keep the posts readable.

`src/styles.css` is the design source of truth. `src/App.tsx` composes a desktop navigation rail, utility header, compact illustrated introduction, filtering controls, and a two-column feed. Mobile prioritizes the product and controls, with the original-post action visible in the first 390 × 844 screen. This is intentionally a single dark theme.

## Colors

Primitives and semantic aliases are declared at `src/styles.css:8`. Components use semantic tokens; illustration colors belong to the SVG artwork.

| Semantic token | Value | Use |
| --- | --- | --- |
| `--color-bg` | `#0b120e` | Page canvas |
| `--color-sidebar` | `#0e1711` | Navigation, search, sort group |
| `--color-surface` | `#111d15` | Post cards and dialog |
| `--color-hover` | `#18271c` | Hover, neutral selected controls, notification |
| `--color-line` | `#233529` | Structural dividers and card borders |
| `--color-line-strong` | `#304735` | Stronger outlines and card hover |
| `--color-text` | `#e9efdf` | Body and heading text |
| `--color-muted` | `#94a592` | Handles, dates, secondary copy, metrics |
| `--color-accent` | `#b6eb7a` | Main action, links, selected icons, brand emphasis |
| `--color-accent-hover` | `#a4d669` | Primary-button hover |
| `--color-accent-ink` | `#14220c` | Text on the lime main action |
| `--color-selected` | `#20361e` | Selected navigation/topic fill |
| `--color-focus` | `#b6eb7a` | Two-pixel keyboard focus outline |

The probe measured body text on post surfaces at 14.77:1, muted feed context on the page at 7.28:1, and primary-button text on lime at 11.99:1. Image-backed text was not fully measured; see the review limitations. Active controls also have shape, fill, labels, or `aria-pressed`, so color is not their only cue.

## Typography

One local family: **DM Sans**, with Arial and generic sans-serif fallbacks. `public/fonts/dm-sans-latin.woff2` loads through `@font-face` with `font-display: swap`. The interface uses weights 400, 500, and 700. The font license is alongside the asset.

| Token | Size at the default root | Role |
| --- | --- | --- |
| `--text-caption` | 12px / 0.75rem | Handles, dates, compact topics, metrics, secondary labels |
| `--text-small` | 14px / 0.875rem | Desktop controls, descriptions, navigation |
| `--text-body` | 16px / 1rem | Quoted post text, mobile inputs/selects |
| `--text-heading` | 20px / 1.25rem | Feed section title and empty-state title |
| `--text-title` | 32px / 2rem | Mobile page title and dialog title |
| `--text-display` | 52px / 3.25rem | Desktop page title |

The main title uses weight 700, line-height 1.04, and tracking -0.055em; mobile uses 1.06 and -0.045em. Post text uses line-height 1.6 and preserves the author's paragraph breaks. Headings balance wrapping; prose uses `text-wrap: pretty`. Long URLs can wrap. Metrics and result counts use tabular numerals.

Posts longer than 340 characters initially show a word-boundary excerpt near 300 characters. “Read full post” reveals the complete text, and “Show less” restores the excerpt. Meaningful content is not hidden behind an unreachable CSS ellipsis.

## Layout

The declared spacing steps are 4, 8, 12, 16, 24, 32, and 40px (`--space-1` through `--space-7`). Component rules also use compact 10, 18, 20, and 22px values for optical alignment and density. Common content edges, rather than nested panels, organize the page.

- The outer layout has a 1680px maximum width. The desktop rail is 224px, and the main content has a 1320px maximum with 40px inline padding.
- The introduction combines text with an illustration capped at 260px tall. The feed follows immediately below its divider.
- Posts form two equal columns with a 20px gap. Each card has its own header, quote, optional media preview, topic labels, and action footer. Cards in a row share height so their action rows align.
- At **1160px and below**, the rail becomes 198px, main/header padding becomes 28px, and card padding becomes 18px. The redundant footer “Open” label can collapse to its labeled arrow icon.
- At **960px and below**, the rail disappears. A header brand and saved-post control replace it; topic and source controls remain available in the main content.
- At **680px and below**, the search field occupies a full header row, posts become one column, and main padding becomes 20px. Native topic and date selects replace the desktop topic chips. The 32px title and a 145px illustration fit above a full-width description.
- At **370px and below**, padding becomes 16px, the illustration becomes 120px, sort labels use the caption size, and redundant select icons and the snapshot prefix disappear. The date remains visible and the controls stay usable.
- Above **1500px**, the introduction has a 330px minimum height.

The rail's inner navigation is sticky; the primary header and feed are in normal flow. The notification is fixed near the viewport bottom and explicitly dismissible. Reflow was checked at 320, 390, 680, 900, 1160, and 1440px. Doubling root text size at 390px also passed. English is the implemented language; RTL and browser-native zoom were not verified.

## Elevation & depth

The interface is mostly flat: green tonal steps and one-pixel borders establish structure. Cards do not combine shadows with their borders. The notification alone uses `0 8px 28px #0006` to separate it from the feed. The native modal uses a `#020704cf` backdrop and a border, without a shadow.

Post images have a low-opacity white outline. Video labels sit on a near-opaque `#0b120ef0` background. The illustrated hero's shading and dotted radar field are artwork, not extra UI layers.

## Shapes

`--radius-medium` is 12px for cards/empty states; `--radius-large` is 16px for the dialog; `--radius-small` declares the 6px compact-control step. Buttons use 8px, chips 6px, media 7px, and the notification 10px. Avatars and the completion marker are circular. Media clipping is limited to its image container; post text remains selectable and expandable.

## Components

### Page and navigation (`src/App.tsx`)

`App` manages `#feed`/`#saved`, search, date/topic/sort state, pagination, and browser-local bookmarks. All navigation uses real anchors. Filters use buttons with pressed state or native labeled selects. The result description and notifications use stable polite live regions.

The sources dialog is a native `<dialog>` opened with `showModal()`. It focuses the close control, cycles Tab/Shift+Tab within its controls, closes with Escape, and returns focus to the opener. The background is made inert by the native modal behavior.

### Post card (`src/components/PostCard.tsx`)

`PostCard` takes `post`, `saved`, `onSave`, `onShare`, and `index`. It renders attribution, a date link to the original post, an expandable quote, optional media, snapshot metrics, and real save/copy/open actions. `PostText` renders text safely as React nodes and links only URLs and account mentions. Counts are informational, not fake like/repost buttons.

Saving changes the bookmark icon and pressed state. The persistence destination is explained in the source dialog and save feedback. Copy failure exposes a selectable read-only URL. Videos are static previews labeled “Watch on X”; they do not imply inline playback. New-tab actions use `noopener noreferrer`.

### Controls (`src/styles.css`)

- `.primary-button`: the lime “Explore on X” action, with dark text.
- `.secondary-button`: neutral bordered actions such as loading more or recovering from empty filters.
- `.icon-button`: labeled utility actions with hover, focus, and saved states.
- `.sort-button`, `.topic-chip`, `.period-select`: controls immediately above the feed they affect.
- `.empty-state`: explains either no matches or an empty saved list, with one recovery action.
- `.notice`: persistent, dismissible success/error feedback; it can include the copy fallback field.

Focus uses a 2px outline with a 4px offset, with a forced-colors override. Interactive transitions name their properties and run for 150ms only under `prefers-reduced-motion: no-preference`. Press feedback scales buttons to 0.96. There are no continuous animations or automatic media playback. Some compact controls are below the preferred 44px size but meet the probe's 24px-or-spacing baseline.

### Icons and artwork

`src/components/Icon.tsx` is one inline SVG icon set: 24-unit viewBox, current color, rounded ends, and 1.65px strokes. Decorative icons are hidden from assistive technology; controls supply names. Use the `IconName` union instead of adding a second library. The hero illustration has an informative description; avatars are decorative alongside their text attribution.

## Do's and don'ts

- Reuse the semantic color and type tokens, card composition, and native control patterns.
- Keep the collection scope, snapshot date, ranking method, and bookmark destination visible or one action away.
- Add a post with its verified original URL, full text, retrieval record, and local media; rebuild after changing the collection.
- Keep source links usable and expose complete long text. Never turn recorded counts into simulated live data.
- Keep art secondary to reading and controls on narrow screens. Avoid extra introductory sections above the feed.
- Keep one high-emphasis action per view. Reserve shadows for temporary floating feedback.

For another view, reuse `App`'s workspace and feed hierarchy, preserve hash navigation, compose `PostCard` for posts, and validate the new empty/focus states at 320 and 390px. Do not add wallet infrastructure to this reader.

Design guidance attribution is in `THIRD_PARTY_NOTICES.md`; evidence and outstanding verification limits are in `VALIDATION.md`.
