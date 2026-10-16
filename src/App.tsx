import { useEffect, useMemo, useRef, useState } from "react";
import { Icon, type IconName } from "./components/Icon";
import { PostCard } from "./components/PostCard";
import {
  avatarCount,
  posts,
  readSaved,
  selectPosts,
  topics,
  xSearch,
  type Period,
  type Post,
  type Sort,
  type Topic,
} from "./data/feed";

type View = "feed" | "saved";
const topicIcons: Record<Topic, IconName> = {
  "All topics": "grid",
  "The swarm": "spark",
  Builders: "code",
  Community: "users",
  Memes: "image",
};
const initialView = (): View => (location.hash === "#saved" ? "saved" : "feed");

export default function App() {
  const [view, setView] = useState<View>(initialView);
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState<Topic>("All topics");
  const [period, setPeriod] = useState<Period>(
    initialView() === "saved" ? "all" : "week",
  );
  const [sort, setSort] = useState<Sort>("top");
  const [savedState, setSavedState] = useState(readSaved);
  const [notice, setNotice] = useState("");
  const [copyUrl, setCopyUrl] = useState("");
  const [showCount, setShowCount] = useState(6);
  const dialog = useRef<HTMLDialogElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const aboutTrigger = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const onHash = () => {
      setView(initialView());
      setPeriod(initialView() === "saved" ? "all" : "week");
      setTopic("All topics");
      setQuery("");
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === "swamp-signal:saved") setSavedState(readSaved());
    };
    window.addEventListener("hashchange", onHash);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("hashchange", onHash);
      window.removeEventListener("storage", onStorage);
    };
  }, []);
  useEffect(() => {
    setShowCount(6);
  }, [query, topic, period, sort, view]);
  useEffect(() => {
    document.title =
      view === "saved"
        ? "Saved posts · Swamp Signal"
        : "Swamp Signal · Top IdentityMD tweets";
  }, [view]);

  const filtered = useMemo(
    () =>
      selectPosts({
        query,
        topic,
        period,
        sort,
        saved: savedState.ids,
        onlySaved: view === "saved",
      }),
    [query, topic, period, sort, savedState.ids, view],
  );
  const shown = filtered.slice(0, showCount);
  const switchView = (next: View) => {
    setView(next);
    setQuery("");
    setTopic("All topics");
    setPeriod(next === "saved" ? "all" : "week");
    setSort("top");
    if (location.hash !== `#${next}`) location.hash = next;
  };
  const resetFilters = () => {
    setQuery("");
    setTopic("All topics");
    setPeriod("all");
  };
  const chooseTopic = (next: Topic) => {
    setTopic(next);
    if (next === "Memes") setPeriod("all");
  };
  const savePost = (id: string) => {
    const removing = savedState.ids.includes(id);
    const ids = removing
      ? savedState.ids.filter((item) => item !== id)
      : [...savedState.ids, id];
    let available = true;
    try {
      localStorage.setItem("swamp-signal:saved", JSON.stringify(ids));
    } catch {
      available = false;
    }
    setSavedState({ ids, available });
    setNotice(
      available
        ? removing
          ? "Post removed from saved."
          : "Post saved on this device."
        : "Browser storage is unavailable. Saved posts will last for this visit only.",
    );
    setCopyUrl("");
  };
  const sharePost = async (post: Post) => {
    try {
      if (!navigator.clipboard) throw new Error("No clipboard");
      await navigator.clipboard.writeText(post.url);
      setNotice("Post link copied.");
      setCopyUrl("");
    } catch {
      setCopyUrl(post.url);
      setNotice("Copy this post link:");
    }
  };
  const openAbout = () => {
    aboutTrigger.current = document.activeElement as HTMLElement;
    dialog.current?.showModal();
  };
  const closeAbout = () => {
    dialog.current?.close();
    aboutTrigger.current?.focus();
  };

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to feed
      </a>
      <div className="app-layout">
        <aside className="sidebar">
          <a
            className="brand"
            href="#feed"
            onClick={() => switchView("feed")}
            aria-label="Swamp Signal home"
          >
            <img src="./favicon.svg" width="38" height="38" alt="" />
            <span>
              swamp
              <span className="brand-signal">
                signal<span className="brand-dot">.</span>
              </span>
            </span>
          </a>
          <div className="sidebar-inner">
            <p className="sidebar-caption">The IdentityMD feed</p>
            <nav className="main-nav" aria-label="Main navigation">
              <a
                href="#feed"
                onClick={() => switchView("feed")}
                className={view === "feed" ? "nav-item active" : "nav-item"}
                aria-current={view === "feed" ? "page" : undefined}
              >
                <Icon name="fire" />
                <span>Top tweets</span>
                <span className="nav-indicator" />
              </a>
              <a
                href="#saved"
                onClick={() => switchView("saved")}
                className={view === "saved" ? "nav-item active" : "nav-item"}
                aria-current={view === "saved" ? "page" : undefined}
              >
                <Icon name="bookmark" />
                <span>Saved posts</span>
                <span className="nav-count">{savedState.ids.length}</span>
              </a>
            </nav>
            <div className="topic-nav">
              <p className="sidebar-caption">Explore topics</p>
              <nav aria-label="Explore topics">
                {topics.slice(1).map((item) => (
                  <button
                    key={item}
                    className={`nav-item ${topic === item ? "topic-active" : ""}`}
                    aria-pressed={topic === item}
                    onClick={() =>
                      chooseTopic(topic === item ? "All topics" : item)
                    }
                  >
                    <Icon name={topicIcons[item]} />
                    <span>{item}</span>
                    <span className="topic-count">
                      {posts.filter((p) => p.tags.includes(item)).length}
                    </span>
                  </button>
                ))}
              </nav>
            </div>
            <div className="sidebar-bottom">
              <div className="field-note">
                <span className="field-note-icon">
                  <Icon name="signal" size={22} />
                </span>
                <strong>A little less noise.</strong>
                <p>A little more of what the swamp is building.</p>
                <a
                  href="https://imd.fun"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Explore IdentityMD
                  <Icon name="arrow" size={15} />
                </a>
              </div>
              <button className="about-link" onClick={openAbout}>
                <Icon name="info" size={17} />
                About this feed
              </button>
              <span className="sidebar-credit">
                Independent. Community made.
              </span>
            </div>
          </div>
        </aside>
        <div className="workspace">
          <header className="topbar">
            <a
              className="mobile-brand"
              href="#feed"
              onClick={() => switchView("feed")}
              aria-label="Swamp Signal home"
            >
              <img src="./favicon.svg" width="32" height="32" alt="" />
              <strong>
                swamp signal<span>.</span>
              </strong>
            </a>
            <div className="search-box">
              <label htmlFor="post-search">
                <Icon name="search" size={18} />
                <span className="sr-only">
                  Search posts, people, or keywords
                </span>
              </label>
              <input
                id="post-search"
                ref={search}
                name="search"
                type="search"
                autoComplete="off"
                placeholder="Search the swamp…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query && (
                <button
                  className="search-clear"
                  aria-label="Clear search"
                  onClick={() => {
                    setQuery("");
                    search.current?.focus();
                  }}
                >
                  <Icon name="close" size={16} />
                </button>
              )}
            </div>
            <div className="topbar-tools">
              <button
                className={`mobile-saved icon-button ${view === "saved" ? "is-saved" : ""}`}
                aria-label={
                  view === "saved"
                    ? "Back to top tweets"
                    : `Show saved posts (${savedState.ids.length})`
                }
                onClick={() => switchView(view === "saved" ? "feed" : "saved")}
              >
                <Icon name={view === "saved" ? "fire" : "bookmark"} />
              </button>
              <a
                className="primary-button"
                href={xSearch}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon name="x" size={15} />
                <span>Explore on X</span>
                <Icon name="arrow" size={16} />
              </a>
            </div>
          </header>
          <main id="main-content" tabIndex={-1}>
            <section
              className={`hero ${view === "saved" ? "saved-hero" : ""}`}
              aria-labelledby="page-title"
            >
              <div className="hero-copy">
                <h1 id="page-title">
                  {view === "saved" ? (
                    <>
                      Good signal.
                      <br />
                      <span>Worth keeping.</span>
                    </>
                  ) : (
                    <>
                      The swamp
                      <br />
                      has <span>signal.</span>
                    </>
                  )}
                </h1>
                <p>
                  {view === "saved"
                    ? "Your saved IdentityMD posts, all in one place."
                    : "Top IdentityMD tweets. All the signal, less noise."}
                </p>
                <div className="hero-details">
                  {view === "saved" ? (
                    <>
                      <Icon name="bookmark" size={16} />
                      <span>Saved in this browser</span>
                    </>
                  ) : (
                    <>
                      <span className="avatar-stack">
                        {["surfcoderepeat", "nagato0x", "imdradar"].map(
                          (handle) => (
                            <img
                              key={handle}
                              src={`./images/avatar-${handle}.jpg`}
                              width="24"
                              height="24"
                              alt=""
                            />
                          ),
                        )}
                      </span>
                      <span>
                        <strong>{posts.length} posts</strong> from {avatarCount}{" "}
                        community voices
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="hero-art">
                <img
                  src="./images/swamp-crew.svg"
                  width="560"
                  height="330"
                  alt="Two Pepes equipped with an AI blaster, a field terminal, and a scout drone"
                />
                <span className="art-caption">
                  <span />
                  Armed with intelligence.
                </span>
              </div>
            </section>
            <section className="feed-section" aria-labelledby="feed-title">
              <div className="feed-heading">
                <div className="feed-title-wrap">
                  <h2 id="feed-title">
                    {view === "saved" ? "Saved posts" : "In the swamp"}
                  </h2>
                  <span className="result-badge">{filtered.length}</span>
                </div>
                <button className="snapshot-button" onClick={openAbout}>
                  <span className="snapshot-dot" />
                  <span>
                    <span className="snapshot-prefix">Snapshot · </span>Oct 16,
                    2026
                  </span>
                  <Icon name="info" size={14} />
                </button>
              </div>
              <div className="filter-bar">
                <div
                  className="sort-group"
                  role="group"
                  aria-label="Sort posts"
                >
                  {(
                    [
                      { value: "top", label: "Top", icon: "fire" },
                      { value: "latest", label: "Latest", icon: "clock" },
                      {
                        value: "reposts",
                        label: "Most reposted",
                        icon: "repeat",
                      },
                    ] as const
                  ).map((item) => (
                    <button
                      className={
                        sort === item.value
                          ? "sort-button selected"
                          : "sort-button"
                      }
                      key={item.value}
                      onClick={() => setSort(item.value)}
                      aria-pressed={sort === item.value}
                    >
                      <Icon name={item.icon} size={17} />
                      {item.label}
                    </button>
                  ))}
                </div>
                <label className="mobile-topic-select period-select">
                  <span className="sr-only">Filter by topic</span>
                  <Icon name="grid" size={16} />
                  <select
                    value={topic}
                    onChange={(e) => chooseTopic(e.target.value as Topic)}
                  >
                    {topics.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  <Icon name="chevron" size={14} />
                </label>
                <label className="period-select">
                  <span className="sr-only">
                    Post date range, relative to snapshot
                  </span>
                  <Icon name="clock" size={16} />
                  <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value as Period)}
                  >
                    <option value="week">Past 7 days</option>
                    <option value="month">Past 30 days</option>
                    <option value="all">All dates</option>
                  </select>
                  <Icon name="chevron" size={14} />
                </label>
              </div>
              <div
                className="topic-filters"
                role="group"
                aria-label="Filter by topic"
              >
                {topics.map((item) => (
                  <button
                    key={item}
                    className={
                      topic === item ? "topic-chip selected" : "topic-chip"
                    }
                    onClick={() => chooseTopic(item)}
                    aria-pressed={topic === item}
                  >
                    {item === "All topics" && <Icon name="grid" size={13} />}
                    {item}
                  </button>
                ))}
              </div>
              <p className="feed-context" role="status" aria-live="polite">
                {query
                  ? `${filtered.length} ${filtered.length === 1 ? "post" : "posts"} matching “${query}”`
                  : `${sort === "top" ? "Ranked by likes" : sort === "latest" ? "Newest first" : "Ranked by reposts"} · ${period === "all" ? "All dates in the snapshot" : `Through Oct 16, 2026`}`}
              </p>
              {!savedState.available && (
                <p className="storage-note">
                  Browser storage is unavailable. Saved posts last for this
                  visit only.
                </p>
              )}
              {shown.length > 0 ? (
                <>
                  <div className="post-grid">
                    {shown.map((post, index) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        saved={savedState.ids.includes(post.id)}
                        onSave={savePost}
                        onShare={sharePost}
                        index={index}
                      />
                    ))}
                  </div>
                  <div className="feed-end">
                    {filtered.length > showCount ? (
                      <button
                        className="secondary-button"
                        onClick={() => setShowCount((count) => count + 6)}
                      >
                        Show {Math.min(6, filtered.length - showCount)} more
                        posts
                        <Icon name="chevron" size={17} />
                      </button>
                    ) : (
                      <>
                        <span className="end-mark">
                          <Icon name="check" size={18} />
                        </span>
                        <p>You’re caught up with this snapshot.</p>
                        <a
                          href={xSearch}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Keep exploring on X<Icon name="arrow" size={15} />
                        </a>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <div className="empty-state">
                  <Icon
                    name={
                      view === "saved" && savedState.ids.length === 0
                        ? "bookmark"
                        : "search"
                    }
                    size={32}
                  />
                  <h3>
                    {view === "saved" && savedState.ids.length === 0
                      ? "Keep the good stuff."
                      : "No signal here. Yet."}
                  </h3>
                  <p>
                    {view === "saved" && savedState.ids.length === 0
                      ? "Save a post using its bookmark button. It will be waiting here on this device."
                      : "No posts match these filters. Try another keyword or explore all dates."}
                  </p>
                  <button
                    className="secondary-button"
                    onClick={
                      view === "saved" && savedState.ids.length === 0
                        ? () => switchView("feed")
                        : resetFilters
                    }
                  >
                    {view === "saved" && savedState.ids.length === 0
                      ? "Explore top tweets"
                      : "Clear filters"}
                    <Icon name="arrow" size={16} />
                  </button>
                </div>
              )}
            </section>
            <footer className="page-footer">
              <span>Made for the IdentityMD community.</span>
              <button onClick={openAbout}>
                Sources & ranking
                <Icon name="arrow" size={14} />
              </button>
              <span>Not affiliated with X.</span>
            </footer>
          </main>
        </div>
      </div>
      <div className={`notice ${notice ? "visible" : ""}`}>
        <span role="status" aria-live="polite">
          {notice}
        </span>
        {copyUrl && (
          <input
            aria-label="Post link to copy"
            readOnly
            value={copyUrl}
            onFocus={(e) => e.target.select()}
          />
        )}
        {notice && (
          <button
            className="icon-button"
            aria-label="Dismiss notification"
            onClick={() => {
              setNotice("");
              setCopyUrl("");
            }}
          >
            <Icon name="close" size={16} />
          </button>
        )}
      </div>
      <dialog
        ref={dialog}
        className="about-dialog"
        aria-labelledby="about-title"
        onClick={(e) => {
          if (e.target === e.currentTarget) closeAbout();
        }}
        onClose={() => aboutTrigger.current?.focus()}
        onKeyDown={(event) => {
          if (event.key !== "Tab") return;
          const controls = Array.from(
            event.currentTarget.querySelectorAll<HTMLElement>(
              'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), [tabindex="0"]',
            ),
          ).filter((element) => element.getClientRects().length > 0);
          const first = controls[0],
            last = controls[controls.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
          }
          if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
        }}
      >
        <div className="dialog-heading">
          <img src="./favicon.svg" width="36" height="36" alt="" />
          <button
            className="icon-button"
            onClick={closeAbout}
            aria-label="Close about this feed"
            autoFocus
          >
            <Icon name="close" />
          </button>
        </div>
        <h2 id="about-title">A clearer view of the swamp.</h2>
        <p>
          Swamp Signal is an independent reader for public posts about
          IdentityMD.
        </p>
        <h3>A snapshot, with sources</h3>
        <p>
          These {posts.length} posts from {avatarCount} accounts were retrieved
          on October 16, 2026, through public X pages and FxTwitter. Every card
          links to the original. This is a small collection, not a complete
          index of X.
        </p>
        <h3>What makes a top tweet?</h3>
        <p>
          Top sorts this collection by recorded likes. Most reposted sorts by
          recorded reposts. Date filters are relative to October 16, 2026.
          Counts do not update live.
        </p>
        <h3>Your own little archive</h3>
        <p>
          Bookmarks stay in this browser’s local storage. They are not synced to
          X or other devices. Clearing browser data removes them.
        </p>
        <h3>Original voices</h3>
        <p>
          Post text and media belong to their authors. Their claims are quoted,
          not independently verified. Video thumbnails open the original video
          on X, which may require sign-in.
        </p>
        <div className="dialog-links">
          <a href={xSearch} target="_blank" rel="noopener noreferrer">
            Find more on X<Icon name="arrow" size={16} />
          </a>
          <a href="https://imd.fun" target="_blank" rel="noopener noreferrer">
            Visit IdentityMD
            <Icon name="arrow" size={16} />
          </a>
        </div>
      </dialog>
    </>
  );
}
