import type { CSSProperties } from "react";

export type IconName =
  | "signal"
  | "fire"
  | "clock"
  | "bookmark"
  | "search"
  | "arrow"
  | "chevron"
  | "close"
  | "heart"
  | "repeat"
  | "reply"
  | "share"
  | "info"
  | "grid"
  | "spark"
  | "code"
  | "users"
  | "check"
  | "play"
  | "image"
  | "x";
const paths: Record<IconName, React.ReactNode> = {
  signal: (
    <>
      <path d="M4 20v-4m5 4v-8m5 8V8m5 12V4" />
    </>
  ),
  fire: (
    <path d="M13 3c2 6-4 6-1 10 2-1 3-3 3-5 5 4 6 7 3 11-3 4-10 3-12 0-4-6 1-8 1-12 1 2 2 3 3 4 2-2 2-5 3-8Z" />
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  bookmark: <path d="M6 4h12v17l-6-4-6 4V4Z" />,
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </>
  ),
  arrow: (
    <>
      <path d="M6 18 18 6M6 6h12v12" />
    </>
  ),
  chevron: <path d="m7 10 5 5 5-5" />,
  close: <path d="m6 6 12 12M6 18 18 6" />,
  heart: (
    <path d="M20.5 5.5c-2.5-2.5-6-1.5-8.5 1C9.5 4 6 3 3.5 5.5c-4 4 2 10 8.5 15 6.5-5 12.5-11 8.5-15Z" />
  ),
  repeat: (
    <>
      <path d="m16 3 4 4-4 4M20 7H7a3 3 0 0 0-3 3v2m4 9-4-4 4-4M4 17h13a3 3 0 0 0 3-3v-2" />
    </>
  ),
  reply: (
    <path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H4l1.5-4A8.5 8.5 0 1 1 21 11.5Z" />
  ),
  share: (
    <>
      <path d="M12 16V3m-5 5 5-5 5 5M5 13v7h14v-7" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v6m0-10v.1" />
    </>
  ),
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </>
  ),
  spark: (
    <>
      <path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z" />
      <path d="M20 2v4m-2-2h4" />
    </>
  ),
  code: (
    <>
      <path d="m7 7-5 5 5 5m10-10 5 5-5 5m-3-13-4 18" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M2 21v-3a7 7 0 0 1 14 0v3m0-17a3 3 0 0 1 0 6m3 5c2 0 3 2 3 4v2" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
  play: <path d="m9 5 11 7-11 7V5Z" />,
  image: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8" cy="8" r="1" />
      <path d="m4 17 5-5 4 4 3-3 5 5" />
    </>
  ),
  x: <path d="M4 3h4l12 18h-4L4 3Zm0 18L20 3" />,
};
export function Icon({
  name,
  size = 20,
  style,
}: {
  name: IconName;
  size?: number;
  style?: CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={style}
    >
      {paths[name]}
    </svg>
  );
}
