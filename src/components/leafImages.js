// Small inline SVG leaves (no network requests). Muted autumn tones: cream, gold, olive, rust.
const leaf = (fill) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M32 3C49 14 57 31 50 49 45 58 35 61 32 61 29 61 19 58 14 49 7 31 15 14 32 3Z" fill="${fill}"/><path d="M32 9V60M32 30l-9-8M32 40l10-9M32 48l-8-7" stroke="rgba(0,0,0,0.28)" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>`
  )}`;

export const LEAF_CREAM = leaf('#E9DDBF');
export const LEAF_GOLD = leaf('#C9A45C');
export const LEAF_OLIVE = leaf('#7C8F4E');
export const LEAF_RUST = leaf('#A8603A');
