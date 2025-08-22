"use client";

import React, { useState } from "react";

// Helper: format numbers (e.g. 1200 → 1,200)
function formatNumber(n) {
  return new Intl.NumberFormat().format(n);
}

// Reusable card section
function SectionCard({ title, children }) {
  return (
    <section
      className="rounded-2xl border border-neutral-200/70 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/60 p-4 mb-4"
      aria-label={title}
    >
      <h2 className="text-xs font-semibold text-neutral-700 dark:text-neutral-200 mb-3 tracking-wide uppercase">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function RightSidebar({ trending = [], suggestions = [], loading = false }) {
  // Local follow state: { [id]: true/false }
  const [following, setFollowing] = useState({});
  const [loadingBtn, setLoadingBtn] = useState({}); // { [id]: true/false }

  // Simulate async follow/unfollow
  function handleFollow(id) {
    setLoadingBtn((l) => ({ ...l, [id]: true }));
    setTimeout(() => {
      setFollowing((f) => ({ ...f, [id]: !f[id] }));
      setLoadingBtn((l) => ({ ...l, [id]: false }));
    }, 600);
  }

  // Trending pills skeleton
  const trendingSkeleton = Array.from({ length: 5 }).map((_, i) => (
    <span
      key={i}
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-100/60 dark:bg-neutral-800/40 text-neutral-300 dark:text-neutral-700 text-sm animate-pulse"
      style={{ minWidth: 60, minHeight: 28 }}
    ></span>
  ));

  // Suggestions skeleton
  const suggestionsSkeleton = Array.from({ length: 4 }).map((_, i) => (
    <li key={i} className="flex items-center gap-3 py-2">
      <span className="w-9 h-9 rounded-full bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
      <span className="flex-1 h-4 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
      <span className="w-16 h-8 rounded-full bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
    </li>
  ));

  return (
    <aside className="hidden xl:block xl:col-span-3">
      <div className="sticky top-20 space-y-4">
        {/* Trending Section */}
        <SectionCard title="Trending">
          <ul className="flex flex-wrap gap-2 mb-2">
            {loading
              ? trendingSkeleton
              : trending.slice(0, 8).map(({ tag, count }) => (
                  <li key={tag}>
                    <a
                      href={`/search?q=%23${encodeURIComponent(tag)}`}
                      aria-label={`Voir #${tag}`}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/60 text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:bg-violet-50 dark:hover:bg-violet-900/30 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                      tabIndex={0}
                    >
                      #{tag}
                      {typeof count === "number" && (
                        <span className="text-xs text-neutral-400">{formatNumber(count)}</span>
                      )}
                    </a>
                  </li>
                ))}
          </ul>
          <a
            href="/trending"
            className="text-xs text-violet-600 hover:underline font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
          >
            Show more
          </a>
        </SectionCard>

        {/* Who to follow Section */}
        <SectionCard title="Who to follow">
          <ul>
            {loading
              ? suggestionsSkeleton
        : suggestions.slice(0, 5).map((user) => (
          <li key={user && user.id ? user.id : user?.username || Math.random()} className="flex items-center gap-3 py-2">
                    <img
                      src={user.avatar || "/file.svg"}
                      alt={user.username}
                      className="w-9 h-9 rounded-full object-cover ring-1 ring-neutral-200 dark:ring-neutral-700"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-neutral-800 dark:text-neutral-100 truncate">
                        {user.username}
                      </div>
                      {user.bio && (
                        <div className="text-xs text-neutral-500 truncate">{user.bio}</div>
                      )}
                    </div>
                    <button
                      type="button"
                      className={
                        "h-8 px-3 rounded-full text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 " +
                        (user && user.id && following[user.id]
                          ? "border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-200"
                          : "bg-violet-600 hover:bg-violet-700 text-white") +
                        (user && user.id && loadingBtn[user.id] ? " opacity-60 cursor-not-allowed" : "")
                      }
                      aria-label={
                        user && user.id && following[user.id]
                          ? `Unfollow ${user.username}`
                          : `Follow ${user.username}`
                      }
                      disabled={user && user.id && loadingBtn[user.id]}
                      onClick={() => user && user.id && handleFollow(user.id)}
                    >
                      {user && user.id && loadingBtn[user.id]
                        ? "..."
                        : user && user.id && following[user.id]
                        ? "Following"
                        : "Follow"}
                    </button>
                  </li>
                ))}
          </ul>
          <a
            href="/people"
            className="text-xs text-violet-600 hover:underline font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
          >
            Show more
          </a>
        </SectionCard>
      </div>
    </aside>
  );
}


