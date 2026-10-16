# Third-party notices

## Design guidance

This implementation applies the pinned Better Interface reference, adapted from Jakub Krehel's Better Interface at commit `267330e1adfc66a718fb65fa6918c1f06d0a689e` (MIT):
https://github.com/jakubkrehel/skills/tree/267330e1adfc66a718fb65fa6918c1f06d0a689e/skills/better-interface

The design documentation method is adapted from Paul Bakaus's Impeccable at commit `9d715cc4f5564a990ca8345abfdd5df6dc9b41c8` (Apache-2.0):
https://github.com/pbakaus/impeccable/blob/9d715cc4f5564a990ca8345abfdd5df6dc9b41c8/skill/reference/document.md

The original notices and full licenses for both works are retained in `licenses/design-guidance.txt`. The documentation here describes this implementation; it is not a copy of the complete reference manual.

## Font

DM Sans is distributed under the SIL Open Font License. The local font and complete license are in `public/fonts/`, and copied to `dist/fonts/` for the static export.

## Posts and media

Quoted public posts, profile images, and attached media retain their original authors' rights. Each card links to its original X post and profile. `docs/feed-sources.json` records the source URLs, exact retrieved text, engagement, media URLs, and retrieval times. These posts are not presented as the website's own reporting or as author endorsements.

`public/images/swamp-crew.svg`, `public/favicon.svg`, and the social-card composition were drawn for this implementation using the requested Pepe theme. They are separate from the sourced post media.

## Runtime libraries

React and React DOM are MIT-licensed. Their notices are preserved in the production JavaScript bundle, and the full MIT license is in `licenses/react.txt`. Build and validation dependencies are declared in `package.json` and pinned in `package-lock.json`; their dependency directories are not part of this delivery.
