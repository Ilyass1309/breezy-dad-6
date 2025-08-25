import ProfileCard from "./ProfileCard";
import UserAvatar from "./UserAvatar";
import LikeButton from "./LikeButton";
import { likeBreeze, fetchUserProfile, setLikesCount } from "@/utils/api";
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/authcontext";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Post({ post, link = true }) {
  const locale = useLocale();
  const [author, setAuthor] = useState(null);
  const [likesInput, setLikesInput] = useState(post.likes.length);
  const { user } = useAuth();
  const isLiked = user && post.likes && Array.isArray(post.likes) ? post.likes.includes(user.id) : false;
  const router = useRouter();

  // Composant ZoomableImage pour afficher une image avec bouton zoom (modale)
const ZoomableImage = ({ url, alt }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <div className="relative w-full max-w-3xl h-[32rem] overflow-hidden rounded-lg shadow-md flex items-center justify-center bg-base-100">
        <img
          src={url}
          alt={alt}
          className="object-contain w-full h-[32rem] rounded-lg cursor-zoom-in"
          style={{ maxWidth: '100%', maxHeight: '32rem', objectFit: 'contain', background: 'white' }}
          onClick={() => setOpen(true)}
        />
        <button
          className="absolute bottom-2 right-2 btn btn-xs btn-primary z-10"
          onClick={() => setOpen(true)}
        >
          Zoom
        </button>
      </div>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
          onClick={() => setOpen(false)}
        >
          <img
            src={url}
            alt={alt}
            className="max-w-full max-h-full shadow-2xl rounded-lg"
            style={{ background: 'white' }}
            onClick={e => e.stopPropagation()}
          />
          <button
            className="absolute top-4 right-4 btn btn-sm btn-error"
            onClick={() => setOpen(false)}
          >
            Fermer
          </button>
        </div>
      )}
    </>
  );
};

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
      className="mx-auto my-6" style={{ maxWidth: '900px', width: '100%' }}
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
      <div>
        <p>{renderContentWithTags(post.content)}</p>
        {post.mediaUrls && post.mediaUrls.length > 0 && (
          <div className="flex justify-center items-center mt-4">
            {post.mediaUrls.map((url, index) => (
              <ZoomableImage key={index} url={url} alt={`Post image ${index + 1}`} />
            ))}
          </div>

        )}
      </div>
      <LikeButton
        isLiked={isLiked}
        count={post.likes.length}
        onLike={likeBreeze}
        idToLike={post._id}
        onClick={(e) => e.stopPropagation()}
      />

      {user?.username === "Ilyass" && (
        <div className="mt-2 flex gap-2">
          <input
            type="number"
            min={0}
            placeholder="Nbre likes"
            className="input input-sm input-bordered w-24"
            value={likesInput}
            onChange={e => setLikesInput(e.target.value)}
          />
          <button
            className="btn btn-xs btn-warning"
            onClick={async (e) => {
              e.stopPropagation();
              await setLikesCount(post._id, Number(likesInput));
              alert("Compteur modifié !");
            }}
          >
            Set likes
          </button>
        </div>
      )}

      <hr className="border-t border-base-content/30 mt-4 w-full" />
    </div>
  );
}
