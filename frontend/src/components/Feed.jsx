
import Post from "@/components/Post";
import CommentsExpander from "@/components/comment/CommentsExpander";
import { useTranslations } from "next-intl";
import { useState, useEffect, useMemo } from "react";
import { fetchFYPWithPagination, fetchUsersBulkMinimal } from "@/utils/api";

export default function Feed({ posts: initialPosts = [], loadingPosts: initialLoading = false, enablePagination = true }) {
  const t = useTranslations("Feed");
  const PAGE_SIZE = 8;
  const [posts, setPosts] = useState(Array.isArray(initialPosts) ? initialPosts : []);
  const [page, setPage] = useState(1);
  const [authorCache, setAuthorCache] = useState({});
  const [loading, setLoading] = useState(initialLoading);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    setPosts(Array.isArray(initialPosts) ? initialPosts : []);
    setPage(1);
    // If pagination disabled, no more pages
    setHasMore(enablePagination);
  }, [initialPosts, enablePagination]);

  // Sync internal loading with prop changes
  useEffect(() => {
    setLoading(initialLoading);
    if (!initialLoading && !enablePagination) {
      // once loaded in non-paginated mode, ensure no spinner
      setHasMore(false);
    }
  }, [initialLoading, enablePagination]);

  const hydrateAuthors = async (allPosts) => {
    const missing = [];
    for (const p of allPosts) {
      if (p.author && !authorCache[p.author]) missing.push(p.author);
    }
    if (missing.length === 0) return;
    try {
      const minimal = await fetchUsersBulkMinimal([...new Set(missing)]);
      const map = {};
      minimal.forEach(u => { map[u.id] = u; });
      setAuthorCache(prev => ({ ...prev, ...map }));
    } catch {}
  };

  // Hydrate authors for initial / changed posts
  useEffect(() => {
    if (posts.length) {
      hydrateAuthors(posts);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posts]);

  const loadMore = async () => {
    if (!enablePagination) return;
    setLoading(true);
    const nextPage = page + 1;
    try {
      const newPosts = await fetchFYPWithPagination(nextPage, PAGE_SIZE);
      if (Array.isArray(newPosts) && newPosts.length > 0) {
        setPosts((prev) => [...prev, ...newPosts]);
        hydrateAuthors([...posts, ...newPosts]);
        setPage(nextPage);
        if (newPosts.length < PAGE_SIZE) setHasMore(false);
      } else {
        setHasMore(false);
      }
    } catch {
      setHasMore(false);
    }
    setLoading(false);
  };

  const safePosts = useMemo(() => {
    if (!Array.isArray(posts)) {
      return [];
    }
    return posts;
  }, [posts]);

  return (
    <div className="flex flex-col w-full gap-4">
  {safePosts.map((post) => <Post key={post._id} post={post} authorCache={authorCache} />)}
  {loading && (
        <div className="flex justify-center my-4">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      )}
  {!loading && hasMore && enablePagination && (
        <button
          className="btn btn-outline btn-primary mx-auto my-4"
          onClick={loadMore}
        >
          {t("loadMore") || "Voir plus"}
        </button>
      )}
  {!loading && safePosts.length === 0 && (
        <div>
          <p className="text-center text-base-content/50"> {t("noPosts")}</p>
        </div>
      )}
    </div>
  );
}
