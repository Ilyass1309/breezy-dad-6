import { useEffect, useState } from "react";
import Comment from "./Comment";
import { useAuth } from "@/contexts/authcontext";
import { fetchPostComments, updateComment, deleteComment } from "@/utils/api";
import CommentInput from "@/components/comment/CommentInput";
import { useTranslations } from "next-intl";

export default function CommentExpander({ postId }) {
  const t = useTranslations("CommentExpander");
  const { accessToken } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(5);
  const [error, setError] = useState(null);

  // État global du commentaire en édition
  const [editingCommentId, setEditingCommentId] = useState(null);

  const loadingContent = (
    <div className="flex gap-3 p-2 animate-pulse items-start">
      <div className="skeleton h-10 w-10 rounded-full bg-gray-300" />
      <div className="flex flex-col gap-2">
        <div className="skeleton h-3 w-24 rounded bg-gray-300" />
        <div className="skeleton h-3 w-64 rounded bg-gray-300" />
        <div className="skeleton h-3 w-48 rounded bg-gray-300" />
        <div className="flex gap-2 mt-1">
          <div className="skeleton h-4 w-4 rounded bg-gray-300" />
          <div className="skeleton h-4 w-4 rounded bg-gray-300" />
        </div>
      </div>
    </div>
  );

  useEffect(() => {
    async function FetchPostComments() {
      try {
        setError(null);
        if (postId) {
          const comments = await fetchPostComments(postId, accessToken);
          setComments(comments);
        }
      } catch (error) {
        setError(t("errorFetchComments"));
      } finally {
        setLoading(false);
      }
    }

    FetchPostComments();
  }, [postId, accessToken]);

  const handleAddReply = (comment_id, reply) => {
    setComments((prevComments) =>
      prevComments
        .map((comment) => {
          if (comment._id === comment_id) {
            return {
              ...comment,
              repliesCount: (comment.repliesCount || 0) + 1,
            };
          }
          return comment;
        })
        .concat(reply)
    );
  };

  const handleAddComment = (newComment) => {
    setComments((prev) => [newComment, ...(prev || [])]);
    setVisibleCount((prev) => prev + 1); // Affiche aussi le nouveau si on est à la limite
  };

  // Fonction pour mettre à jour un commentaire après édition
  const handleUpdateComment = async (commentId, newContent) => {
    setComments((prev) =>
      prev.map((c) => (c._id === commentId ? { ...c, content: newContent } : c))
    );
    await updateComment(postId, commentId, newContent, accessToken);
    setEditingCommentId(null);
  };

  // Nouvelle fonction pour supprimer un commentaire
  const handleDeleteComment = async (commentId) => {
    // Optionnel : confirmation ici ou dans le composant Comment
    try {
      await deleteComment(postId, commentId, accessToken);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      if (editingCommentId === commentId) {
        setEditingCommentId(null);
      }
    } catch (error) {
      console.error("Erreur lors de la suppression du commentaire", error);
    }
  };

  const handleShowMore = () => {
    setVisibleCount((prev) => prev + 5);
  };

  if (loading) return loadingContent;

  if (error) {
    return (
      <div>
        <CommentInput post_id={postId} onAddComment={handleAddComment} />
        <div className="text-error text-sm mt-1 ml-4">{error}</div>
      </div>
    );
  }

  if (!Array.isArray(comments) || comments.length === 0) {
    return (
      <div>
        <CommentInput post_id={postId} onAddComment={handleAddComment} />
        <div className="p-4 text-sm text-primary italic">
          {t("noComments")}{" "}
        </div>
      </div>
    );
  }

  const visibleComments = Array.isArray(comments)
    ? comments.slice(0, visibleCount)
    : [];
  const hasMore = comments.length > visibleCount;

  return (
    <div className="mt-4">
      <CommentInput post_id={postId} onAddComment={handleAddComment} />
      <div className="flex flex-col p-2">
        {visibleComments.map((comment) => (
          <Comment
            postId={postId}
            key={comment._id}
            comment={comment}
            editingCommentId={editingCommentId}
            setEditingCommentId={setEditingCommentId}
            onUpdateComment={handleUpdateComment}
            onDeleteComment={handleDeleteComment}
            onAddReply={handleAddReply}
          />
        ))}
      </div>
      {hasMore && (
        <div className="text-center my-2">
          <button
            onClick={handleShowMore}
            className="text-sm text-accent hover:underline"
          >
            {t("showMore")}
          </button>
        </div>
      )}
    </div>
  );
}
