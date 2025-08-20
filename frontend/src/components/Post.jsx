import ProfileCard from "./ProfileCard";
import UserAvatar from "./UserAvatar";
import LikeButton from "./LikeButton";
import { likeBreeze, fetchUserProfile } from "@/utils/api";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/authcontext";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Post({ post, link = true }) {
  const locale = useLocale();
  const [author, setAuthor] = useState(null);
  const { user } = useAuth();
  const isLiked = post.likes.includes(user.id);
  const router = useRouter();

  useEffect(() => {
    async function loadAuthor() {
      try {
        const authorProfile = await fetchUserProfile(post.author);
        setAuthor(authorProfile);
      } catch (error) {
        console.error("Error fetching author profile:", error);
        setAuthor("Unknown User");
      }
    }
    loadAuthor();
  }, [post.author]);

  // Fonction utilitaire pour transformer les # en liens
  function renderContentWithTags(content) {
    if (!content) return null;
    const parts = content.split(/(#[\w]+)/g);
    return parts.map((part, i) => {
      if (/^#[\w]+$/.test(part)) {
        const tag = part.slice(1);
        return (
          <Link
            key={i}
            href={`/search?q=${encodeURIComponent(part)}`}
            className="text-accent hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </Link>
        );
      }
      return part;
    });
  }

  return (
    <div
      onClick={() => {
        if (link) {
          router.push(`/post/${post._id}`);
        }
      }}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="tooltip tooltip-toggle" aria-label="Popover Button">
          <UserAvatar size="xs" user={author} />
          <div
            className="tooltip-content tooltip-shown:opacity-100 tooltip-shown:visible z-80"
            role="popover"
          >
            <div className="tooltip-body bg-base-200 max-w-xs card p-4 text-start outline-solid">
              <ProfileCard user={author} full={true} />
            </div>
          </div>
        </div>
        <span className="font-semibold">
          {author && typeof author === "object" && author.username
            ? author.username
            : "Utilisateur inconnu"}
        </span>
        <span
          className="text-base-content/50 text-sm tooltip tooltip-toggle"
          title={new Date(post.createdAt).toLocaleString(locale, {
            dateStyle: "full",
            timeStyle: "short",
          })}
        >
          {new Date(post.createdAt).toLocaleDateString(locale)}
        </span>
      </div>
      <p>{renderContentWithTags(post.content)}</p>
      {post.mediaUrls && post.mediaUrls.length > 0 && (
        <div className="mt-4">
          {post.mediaUrls.map((url, index) => (
            <img
              key={index}
              src={url}
              alt={`Post image ${index + 1}`}
              className="w-full h-auto rounded-lg shadow-md"
            />
          ))}
        </div>
      )}
      <LikeButton
        isLiked={isLiked}
        count={post.likes.length}
        onLike={likeBreeze}
        idToLike={post._id}
        onClick={(e) => e.stopPropagation()}
      />

      <hr className="border-t border-base-content/30 mt-4 w-full" />
    </div>
  );
}
