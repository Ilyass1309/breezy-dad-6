import React, { useState } from "react";
import { addCommentToPost } from "@/utils/api";
import { useAuth } from "@/contexts/authcontext";
import { Image, Video, Smile } from "lucide-react";
import { useNotyf } from "@/contexts/NotyfContext";
import { useTranslations } from "next-intl";
export default function CommentInput({ post_id, onAddComment }) {
  const t = useTranslations("CommentInput");
  const { accessToken } = useAuth();
  const notyf = useNotyf();
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSending(true);
    setError(null);

    try {
      const response = await addCommentToPost(post_id, content, accessToken);

      if (response.status === 201 || response.status === 200) {
        const newComment = response.data;
        onAddComment?.(newComment);
        setContent("");
      } else {
        setError("Échec de l'ajout du commentaire.");
      }
    } catch (err) {
      console.error("Erreur lors de l'envoi du commentaire :", err);
      setError("Une erreur est survenue lors de l'envoie du commentaire.");
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="border border-neutral rounded-lg p-2 flex flex-col gap-2 focus-within:ring-2 focus-within:ring-primary transition">
        {/* Zone de texte */}
        <textarea
          placeholder={t("placeholder")}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={sending}
          rows={3}
          className="resize-none w-full p-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
        />

        {/* Footer interne avec icônes à gauche et bouton à droite */}
        <div className="flex justify-between items-center">
          <div className="flex gap-4 text-gray-500">
            <button
              type="button"
              title={t("addImage")}
              className="hover:text-blue-600 transition"
              onClick={() =>
                notyf.open({
                  type: "warning",
                  message: t("featureInDevelopment"),
                })
              }
            >
              <Image size={20} />
            </button>
            <button
              type="button"
              title={t("addVideo")}
              className="hover:text-green-600 transition"
              onClick={() =>
                notyf.open({
                  type: "warning",
                  message: t("featureInDevelopment"),
                })
              }
            >
              <Video size={20} />
            </button>
            <button
              type="button"
              title={t("addEmoji")}
              className="hover:text-yellow-500 transition"
              onClick={() =>
                notyf.open({
                  type: "warning",
                  message: t("featureInDevelopment"),
                })
              }
            >
              <Smile size={20} />
            </button>
          </div>

          <button
            type="submit"
            disabled={!content.trim() || sending}
            className="px-4 py-2 rounded-full bg-primary text-base-content font-semibold text-sm hover:bg-primary-focus transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? "..." : "Répondre"}
          </button>
        </div>
      </div>

      {error && <div className="text-error text-sm mt-1 ml-4">{error}</div>}
    </form>
  );
}
