import entries from "./posts.json";
export type Topic =
  | "All topics"
  | "The swarm"
  | "Builders"
  | "Community"
  | "Memes";
export type Sort = "top" | "latest" | "reposts";
export type Period = "week" | "month" | "all";
export type Post = (typeof entries)[number];
export const posts: Post[] = entries;
export const topics: Topic[] = [
  "All topics",
  "The swarm",
  "Builders",
  "Community",
  "Memes",
];
export const snapshot = "2026-10-16T17:10:00Z";
export const xSearch =
  "https://x.com/search?q=%22identity.md%22%20OR%20%22imd.fun%22&src=typed_query&f=top";
export const avatarCount = new Set(posts.map((p) => p.handle)).size;
export function selectPosts({
  query,
  topic,
  period,
  sort,
  saved,
  onlySaved,
}: {
  query: string;
  topic: Topic;
  period: Period;
  sort: Sort;
  saved: string[];
  onlySaved: boolean;
}) {
  const days = period === "week" ? 7 : period === "month" ? 30 : Infinity;
  const cutoff = Date.parse(snapshot) - days * 86_400_000;
  const words = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return posts
    .filter((post) => {
      const haystack =
        `${post.author} ${post.handle} ${post.text} ${post.tags.join(" ")}`.toLocaleLowerCase();
      return (
        (!onlySaved || saved.includes(post.id)) &&
        (topic === "All topics" || post.tags.includes(topic)) &&
        Date.parse(post.createdAt) >= cutoff &&
        words.every((word) => haystack.includes(word))
      );
    })
    .sort((a, b) =>
      sort === "latest"
        ? Date.parse(b.createdAt) - Date.parse(a.createdAt)
        : sort === "reposts"
          ? b.reposts - a.reposts || b.likes - a.likes
          : b.likes - a.likes || b.reposts - a.reposts,
    );
}
export function formatCount(value: number) {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}
export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}
export function readSaved(): { ids: string[]; available: boolean } {
  let raw: string | null;
  try {
    raw = localStorage.getItem("swamp-signal:saved");
  } catch {
    return { ids: [], available: false };
  }
  try {
    const data: unknown = JSON.parse(raw || "[]");
    return {
      ids: Array.isArray(data)
        ? [
            ...new Set(
              data.filter(
                (id): id is string =>
                  typeof id === "string" && posts.some((p) => p.id === id),
              ),
            ),
          ]
        : [],
      available: true,
    };
  } catch {
    return { ids: [], available: true };
  }
}
