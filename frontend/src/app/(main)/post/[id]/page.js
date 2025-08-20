"use client";
import CommentExpander from "@/components/comment/CommentsExpander";
import Post from "@/components/Post";
import { fetchPost } from "@/utils/api";
import { useEffect, useState, use } from "react";
import { useTranslations } from "next-intl";
export default function PostPage({ params }) {
  const { id } = use(params);
  // Utilisez React.use() pour obtenir les params
  const [post, setPost] = useState(null);
  const t = useTranslations("Post");

  useEffect(() => {
    async function loadPost() {
      try {
        const fetchedPost = await fetchPost(id);
        setPost(fetchedPost);
      } catch (error) {
        console.error("Error fetching post:", error);
      }
    }
    if (id) {
      loadPost();
    }
  }, [id]);

  if (!post) return <div>{t("loading")}</div>;
  return (
    <div className="p-4">
      <Post post={post} link={false} />
      <CommentExpander postId={post._id} />
    </div>
  );
}
