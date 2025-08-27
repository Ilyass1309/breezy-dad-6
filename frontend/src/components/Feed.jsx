
import Post from "@/components/Post";
import CommentsExpander from "@/components/comment/CommentsExpander";
import { useTranslations } from "next-intl";
import { useState, useEffect, useMemo } from "react";
import { fetchFYPWithPagination } from "@/utils/api";

export default function Feed({ posts: initialPosts = [], loadingPosts: initialLoading = false }) {
  const t = useTranslations("Feed");
  const PAGE_SIZE = 8;
  const [posts, setPosts] = useState(Array.isArray(initialPosts) ? initialPosts : []);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(initialLoading);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
  setPosts(Array.isArray(initialPosts) ? initialPosts : []);
    setPage(1);
    setHasMore(true);
  }, [initialPosts]);

  const loadMore = async () => {
    setLoading(true);
    const nextPage = page + 1;
    try {
      const newPosts = await fetchFYPWithPagination(nextPage, PAGE_SIZE);
      if (Array.isArray(newPosts) && newPosts.length > 0) {
        setPosts((prev) => [...prev, ...newPosts]);
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
      console.warn('[Feed] posts is not an array, received:', posts);
      return [];
    }
    return posts;
  }, [posts]);

  return (
    <div className="flex flex-col w-full gap-4">
  {safePosts.map((post) => <Post key={post._id} post={post} />)}
      {loading && (
        <div className="flex justify-center my-4">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      )}
      {!loading && hasMore && (
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
