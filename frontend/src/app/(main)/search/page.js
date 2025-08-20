"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  fetchTaggedPosts,
  fetchPost,
  fetchUsersByUsername,
  fetchUserProfile,
} from "@/utils/api";
import { useAuth } from "@/contexts/authcontext";
import Post from "@/components/Post";
import ProfileCard from "@/components/ProfileCard";
import { useTranslations } from "next-intl";

export default function SearchPage() {
  const t = useTranslations("searchPage");
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const { user: myUser, accessToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState(initialQuery);
  const [recentSearches, setRecentSearches] = useState([]);
  const [taggedPosts, setTaggedPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [showDeleteIdx, setShowDeleteIdx] = useState(null);
  let longPressTimeout = null;

  // Focus sur l'input au raccourci ⌘+K ou Ctrl+K
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        document.getElementById("searchInput")?.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    const data = localStorage.getItem("recentSearches");
    if (data) {
      const now = Date.now();
      const filtered = JSON.parse(data).filter(
        (item) => now - item.date < 24 * 60 * 60 * 1000
      );
      setRecentSearches(filtered);
    }
  }, []);

  // Déclenche la recherche automatiquement si initialQuery est présent
  useEffect(() => {
    if (initialQuery) {
      // Simule un event pour onChange
      onChange({ target: { value: initialQuery } });
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  const onChange = async (e) => {
    const value = e.target.value;
    setQuery(value);
    setLoading(true);
    setError(null);
    setUsers([]);
    setTaggedPosts([]);

    if (value.trim() === "") {
      setLoading(false);
      return;
    }

    try {
      if (value.startsWith("#")) {
        const tag = value.slice(1).trim();
        if (!tag) {
          setTaggedPosts([]);
          setLoading(false);
          return;
        }
        // Recherche par tag
        const postsListRaw = await fetchTaggedPosts(tag, accessToken);
        if (!postsListRaw || postsListRaw.length === 0) {
          setTaggedPosts([]);
          return;
        }
        const postsList = await Promise.all(
          postsListRaw.map((postId) => fetchPost(postId, accessToken))
        );
        setTaggedPosts(postsList);
      } else {
        // Recherche d'utilisateurs
        const usersResult = await fetchUsersByUsername(value, accessToken);
        // fetchUserProfile pour chaque utilisateur
        if (!usersResult || usersResult.length === 0) {
          setUsers([]);
          return;
        }
        const usersProfiles = await Promise.all(
          usersResult
            .filter((user) => user._id !== myUser.id)
            .map((user) => fetchUserProfile(user._id))
        );
        setUsers(usersProfiles);
      }
    } catch (err) {
      console.error("Erreur lors de la recherche :", err);
      setError("Failed to fetch search results");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    let type = query.startsWith("#") ? "tag" : "user";
    const newSearches = [
      { type, value: query.trim(), date: Date.now() },
      ...recentSearches.filter((item) => item.value !== query.trim()),
    ];
    setRecentSearches(newSearches);
    localStorage.setItem("recentSearches", JSON.stringify(newSearches));
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Barre de recherche */}
      <div className="p-4 bg-base-200 shadow">
        <form className="input input-lg flex space-x-4" onSubmit={onSubmit}>
          {/* Icône loupe */}
          <span className="icon-[tabler--search] text-base-content/80 my-auto size-6 shrink-0"></span>

          <input
            id="searchInput"
            type="search"
            className="grow outline-none text-base-content placeholder:text-base-content/40"
            placeholder={t("searchPlaceholder")}
            value={query}
            onChange={onChange}
          />
          <label className="sr-only" htmlFor="searchInput">
            {t("searchLabel")}
          </label>

          <span className="my-auto flex gap-2 text-base-content/60">
            {typeof window !== "undefined" &&
              (() => {
                const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform);
                const isTouch =
                  "ontouchstart" in window || navigator.maxTouchPoints > 0;
                if (isTouch) return null;
                return (
                  <span className="my-auto flex gap-2 text-base-content/60">
                    <kbd className="kbd kbd-sm">{isMac ? "⌘" : "Ctrl"}</kbd>
                    <kbd className="kbd kbd-sm">K</kbd>
                  </span>
                );
              })()}
          </span>
        </form>
      </div>

      {/* Contenu principal */}
      <main className="flex-1 overflow-auto p-4">
        {query.trim() === "" ? (
          <>
            <h2 className="font-semibold text-base-content/80 mb-2">
              {t("recentSearch")}
            </h2>
            <div className="flex flex-wrap gap-4">
              {recentSearches.map((item, idx) => (
                <div
                  key={idx}
                  className="relative flex flex-col items-center text-sm w-20 cursor-pointer group"
                  onClick={() => {
                    setQuery(item.value);
                    onChange({ target: { value: item.value } });
                  }}
                  onTouchStart={() => {
                    longPressTimeout = setTimeout(
                      () => setShowDeleteIdx(idx),
                      600
                    ); // 600ms pour appui long
                  }}
                  onTouchEnd={() => {
                    clearTimeout(longPressTimeout);
                  }}
                  onMouseLeave={() => setShowDeleteIdx(null)}
                >
                  {/* Croix de suppression visible seulement si showDeleteIdx === idx (mobile) ou au survol (desktop) */}
                  {(showDeleteIdx === idx || window.innerWidth > 768) && (
                    <button
                      className="absolute top-0 right-0 z-10 p-1 rounded-full opacity-0 group-hover:opacity-100 transition bg-white hover:bg-red-100"
                      style={{
                        transform: "translate(40%, -40%)",
                        opacity: showDeleteIdx === idx ? 1 : undefined,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        const updated = recentSearches.filter(
                          (_, i) => i !== idx
                        );
                        setRecentSearches(updated);
                        localStorage.setItem(
                          "recentSearches",
                          JSON.stringify(updated)
                        );
                        setShowDeleteIdx(null);
                      }}
                      aria-label="Supprimer"
                      tabIndex={-1}
                    >
                      <span className="text-xs text-base-content/80 hover:text-red-500">
                        ✕
                      </span>
                    </button>
                  )}
                  <div className="w-10 h-10 bg-base-200 rounded-full mb-1 flex items-center justify-center text-lg">
                    {item.type === "tag" ? (
                      <span className="text-accent">#</span>
                    ) : (
                      <span className="icon-[tabler--user] text-base-content/80" />
                    )}
                  </div>
                  <span className="truncate">
                    {item.type === "tag" ? item.value : `@${item.value}`}
                  </span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-base-content/80">
            {t("resultfor")} <strong>"{query}"</strong> …
            <ul className="mt-4 space-y-2">
              {loading ? (
                <li className="animate-pulse">{t("loading")}</li>
              ) : error ? (
                <li className="text-red-500">{error}</li>
              ) : query.startsWith("#") ? (
                taggedPosts.length > 0 ? (
                  taggedPosts.map((post) => (
                    <li key={post._id} className="card border p-4">
                      <Post post={post} />
                    </li>
                  ))
                ) : (
                  <li>{t("noResults")}</li>
                )
              ) : users.length > 0 ? (
                users.map((user) => (
                  <li key={user.id} className="card border p-4">
                    <ProfileCard user={user} full={true} />
                  </li>
                ))
              ) : (
                <li> {t("noResults")}</li>
              )}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}
