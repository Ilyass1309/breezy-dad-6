import Post from "@/components/Post";
import CommentsExpander from "@/components/comment/CommentsExpander";
import { useTranslations } from "next-intl";

export default function Feed({ posts, loadingPosts }) {
  const t = useTranslations("Feed");

  return (
    <div className="flex flex-col w-full gap-4">
      {loadingPosts ? (
        <p className="text-center"> {t("loading")}</p>
      ) : posts && posts.length > 0 ? (
        posts.map((post) => <Post key={post._id} post={post} />)
      ) : (
        <div>
          <p className="text-center text-base-content/50"> {t("noPosts")}</p>
        </div>
      )}
    </div>
  );
}
