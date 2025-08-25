import Post from "@/components/Post";
import CommentsExpander from "@/components/comment/CommentsExpander";
import { useTranslations } from "next-intl";
import { useState } from "react";

export default function Feed({ posts, loadingPosts }) {
  const t = useTranslations("Feed");
  const PAGE_SIZE = 8;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const visiblePosts = posts ? posts.slice(0, visibleCount) : [];

  return (
    <div className="flex flex-col w-full gap-4">
      {visiblePosts.map((post) => <Post key={post._id} post={post} />)}
      {loadingPosts && (
        <div className="flex justify-center my-4">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      )}
      {!loadingPosts && posts && visibleCount < posts.length && (
        <button
          className="btn btn-outline btn-primary mx-auto my-4"
          onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
        >
          {t("loadMore") || "Charger plus"}
        </button>
      )}
      {!loadingPosts && posts && posts.length === 0 && (
        <div>
          <p className="text-center text-base-content/50"> {t("noPosts")}</p>
        </div>
      )}
    </div>
  );
}
