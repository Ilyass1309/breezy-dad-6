import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/authcontext";

export default function LikeButton({
  isLiked,
  count,
  onLike,
  idToLike,
  onClick,
}) {
  const [liked, setLiked] = useState(isLiked ?? false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [likeCount, setlikeCount] = useState(count ?? 0);

  const { identifier, accessToken } = useAuth();

  const handleLike = async (e) => {
    if (onClick) onClick(e);
    if (loading) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      onLike(!liked, idToLike, accessToken);
      setlikeCount(liked ? likeCount - 1 : likeCount + 1);
      setLiked(!liked);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleLike}
        className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-red-500 transition-all"
      >
        {liked && (
          <span className="icon-[tabler--heart-filled] text-error text-2xl" />
        )}
        {!liked && (
          <span className="icon-[tabler--heart] text-base-content/50 text-2xl" />
        )}
      </button>
      <span className="text-base-content/50"> {likeCount}</span>
    </div>
  );
}
