import { useState } from "react";
import { Icon } from "./Icon";
import { formatCount, formatDate, type Post } from "../data/feed";

function PostText({ text }: { text: string }) {
  return (
    <>
      {text
        .split(/(https?:\/\/[^\s]+|@[a-zA-Z0-9_]+|\$[a-zA-Z][a-zA-Z0-9_]*)/g)
        .map((part, i) =>
          /^https?:/.test(part) ? (
            <a key={i} href={part} target="_blank" rel="noopener noreferrer">
              {part.replace(/^https?:\/\//, "")}
            </a>
          ) : /^@/.test(part) ? (
            <a
              key={i}
              href={`https://x.com/${part.slice(1)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {part}
            </a>
          ) : /^\$/.test(part) ? (
            <span className="cashtag" key={i}>
              {part}
            </span>
          ) : (
            part
          ),
        )}
    </>
  );
}
export function PostCard({
  post,
  saved,
  onSave,
  onShare,
  index,
}: {
  post: Post;
  saved: boolean;
  onSave: (id: string) => void;
  onShare: (post: Post) => void;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const long = post.text.length > 340;
  const preview =
    long && !expanded
      ? `${post.text.slice(0, post.text.lastIndexOf(" ", 300))}…`
      : post.text;
  const firstMedia = post.media[0];
  return (
    <article
      className="post-card"
      data-post-id={post.id}
      aria-label={`Post by ${post.author}`}
    >
      <header className="post-header">
        <a
          className="author-link"
          href={`https://x.com/${post.handle}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            className="avatar"
            src={`./${post.avatar}`}
            width="42"
            height="42"
            alt=""
            loading={index < 2 ? "eager" : "lazy"}
          />
          <span className="author-meta">
            <strong>{post.author}</strong>
            <span>@{post.handle}</span>
          </span>
        </a>
        <a
          className="post-date"
          href={post.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open original post by ${post.author} on X (opens a new tab)`}
        >
          <time
            dateTime={post.createdAt}
            title={`${post.createdAt.slice(0, 10)} UTC`}
          >
            {formatDate(post.createdAt)}
          </time>
          <Icon name="x" size={16} />
        </a>
      </header>
      <blockquote className="post-text">
        <PostText text={preview} />
      </blockquote>
      {long && (
        <button
          className="read-more"
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
        >
          {expanded ? "Show less" : "Read full post"}
          <Icon name="chevron" size={14} />
        </button>
      )}
      {firstMedia && (
        <a
          className={`post-media ${firstMedia.type !== "photo" ? "video-preview" : ""}`}
          href={post.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${firstMedia.type === "photo" ? "View image" : "Watch video"} from ${post.author} on X (opens a new tab)`}
        >
          <img
            src={`./${firstMedia.src}`}
            alt={mediaAlt[post.id] || "Media attached to the original post"}
            loading={index < 2 ? "eager" : "lazy"}
          />
          {firstMedia.type !== "photo" && (
            <span className="video-label">
              <Icon name="play" size={16} />
              Watch on X<Icon name="arrow" size={14} />
            </span>
          )}
          {post.media.length > 1 && (
            <span className="media-count">
              <Icon name="image" size={14} />
              {post.media.length} images on X
            </span>
          )}
        </a>
      )}
      <div className="post-topic">
        {post.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
      <footer className="post-footer">
        <div className="post-metrics" aria-label="Engagement at snapshot time">
          <span title={`${post.likes} likes`}>
            <Icon name="heart" size={17} />
            <span>
              {formatCount(post.likes)}
              <span className="sr-only"> likes</span>
            </span>
          </span>
          <span title={`${post.reposts} reposts`}>
            <Icon name="repeat" size={17} />
            <span>
              {formatCount(post.reposts)}
              <span className="sr-only"> reposts</span>
            </span>
          </span>
          <span title={`${post.replies} replies`}>
            <Icon name="reply" size={17} />
            <span>
              {formatCount(post.replies)}
              <span className="sr-only"> replies</span>
            </span>
          </span>
        </div>
        <div className="post-actions">
          <button
            className={`icon-button save-button ${saved ? "is-saved" : ""}`}
            aria-label={`${saved ? "Unsave" : "Save"} post by ${post.author}`}
            aria-pressed={saved}
            title={saved ? "Remove from saved posts" : "Save on this device"}
            onClick={() => onSave(post.id)}
          >
            <Icon name="bookmark" size={18} />
          </button>
          <button
            className="icon-button"
            aria-label={`Copy link to post by ${post.author}`}
            title="Copy post link"
            onClick={() => onShare(post)}
          >
            <Icon name="share" size={18} />
          </button>
          <a
            className="open-post"
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open post by ${post.author} on X (opens a new tab)`}
          >
            Open
            <Icon name="arrow" size={15} />
          </a>
        </div>
      </footer>
    </article>
  );
}
const mediaAlt: Record<string, string> = {
  "2095213015931203803": "Still from nagato’s Identity.md overview video",
  "2110849667097375208":
    "A table of completed, blocked, and running swarm jobs shared by Adam",
  "2110824473662230879": "IMD network job activity shared by AiRev",
  "2110765083311689890": "Preview of the IMD Radar collections browser",
  "2110166426460029176": "Preview of the IMD Radar launchpad",
  "2109735983281315962": "Still from IMD Radar’s ecosystem group announcement",
  "2107467016999428357":
    "First image of finne’s two-image meme about building with Adam",
};
