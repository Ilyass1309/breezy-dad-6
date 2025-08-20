"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { postBreeze, fetchUserProfile } from "@/utils/api";
import UserAvatar from "@/components/UserAvatar";
import { useAuth } from "@/contexts/authcontext";
import { useTranslations } from "next-intl";
import React from "react";
import Link from "next/link";

export default function CreateBreathPage() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [tags, setTags] = useState([]); // Ajout état pour les tags
  const fileInputRef = useRef(null);
  const { user, accessToken } = useAuth();
  const t = useTranslations("createbreathpage");
  const contentEditableRef = useRef(null);

  // Extraction des hashtags à chaque changement de texte
  useEffect(() => {
    const foundTags = Array.from(
      new Set((text.match(/#(\w+)/g) || []).map((tag) => tag.slice(1)))
    );
    setTags(foundTags);
  }, [text]);

  // Annuler et revenir en arrière
  const handleCancel = () => router.back();

  // Soumettre le “breath”
  const handleSubmit = () => {
    postBreeze(text, tags, selectedImage, accessToken)
      .then(() => {
        // Rediriger vers la page d’accueil ou une autre page après succès
        router.push("/home");
      })
      .catch((error) => {
        console.error("Error posting breath:", error);
        // Gérer l’erreur (afficher un message, etc.)
      });
  };

  // Ouvrir le picker d’image
  const handleImageClick = () => fileInputRef.current?.click();

  // Charger l’image sélectionnée
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setSelectedImage(reader.result);
    reader.readAsDataURL(file);
  };

  // Fonction pour colorer les hashtags dans le texte
  const getHighlightedText = (input) => {
    if (!input) return "";
    // Remplace les #hashtags par un span coloré
    return input.replace(/(#[\w]+)/g, '<span class="text-accent">$1</span>');
  };

  // Gestion de la saisie dans le contenteditable
  const handleContentEditableInput = (e) => {
    const plainText = e.target.innerText;
    setText(plainText);
  };

  // Synchronise le contenteditable si text change ailleurs
  useEffect(() => {
    if (contentEditableRef.current) {
      // Sauvegarde la position du curseur (offset dans le texte brut)
      const selection = window.getSelection();
      let cursorOffset = 0;
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(contentEditableRef.current);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        cursorOffset = preCaretRange.toString().length;
      }
      // Met à jour le HTML enrichi
      contentEditableRef.current.innerHTML = getHighlightedText(text);
      // Replace le curseur à la bonne position
      if (contentEditableRef.current.childNodes.length > 0) {
        let node = contentEditableRef.current;
        let chars = 0;
        let found = false;
        function setCursor(node) {
          for (let i = 0; i < node.childNodes.length; i++) {
            const child = node.childNodes[i];
            if (child.nodeType === 3) {
              // text node
              if (chars + child.length >= cursorOffset) {
                const sel = window.getSelection();
                const range = document.createRange();
                range.setStart(child, cursorOffset - chars);
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);
                found = true;
                break;
              } else {
                chars += child.length;
              }
            } else {
              setCursor(child);
              if (found) break;
            }
          }
        }
        setCursor(node);
      }
    }
  }, [text]);

  return (
    <div className="flex flex-col bg-base-100">
      {/* Navigation bar */}
      <header className="flex items-center justify-between px-4 py-2">
        <button
          onClick={handleCancel}
          className="btn btn-outline btn-primary btn-sm font-semibold"
        >
          {t("Cancel")}
        </button>

        <button
          onClick={handleSubmit}
          className="btn btn-primary btn-sm font-semibold"
        >
           {t("Breath")}
          <span className="icon-[tabler--wind] size-6" />
        </button>
      </header>

      {/* Zone de saisie */}
      <main className="p-4">
        <div className="flex items-start space-x-3">
          {/* Avatar */}
          <UserAvatar user={user} link={false} size="sm" />

          {/* Champ texte enrichi */}
          <div className="flex-1 flex flex-col relative">
            <div
              ref={contentEditableRef}
              className="resize-none placeholder-base-content/80 text-base-content outline-none flex-1 min-h-[96px] p-2 rounded bg-base-200 focus:bg-base-100 border border-base-300 focus:border-primary transition-all"
              contentEditable
              spellCheck={true}
              aria-label="What makes you breath today ?"
              data-placeholder="What makes you breath today ?"
              onInput={handleContentEditableInput}
              suppressContentEditableWarning={true}
              style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
            >
              {/* Le texte initial sera injecté par useEffect */}
            </div>
            {/* Textarea caché pour accessibilité et soumission */}
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="hidden"
              tabIndex={-1}
              aria-hidden="true"
            />
            {/* Affichage des hashtags détectés */}
            {tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/search?q=%23${encodeURIComponent(tag)}`}
                    className="text-accent hover:underline"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Barre d’actions en bas */}
      <footer className="flex items-center justify-between px-4 py-2 border-t bg-base-100">
        {/* Optionnel : ajouter une image */}
        <div className="flex items-center space-x-2 text-base-content">
          <button onClick={handleImageClick} aria-label="Ajouter une image">
            {/* Icône “image” */}
            <span className="icon-[tabler--photo] size-6" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>
      </footer>
    </div>
  );
}
