"use client";

import UserAvatar from "@/components/UserAvatar";
import { fetchUserProfile, fetchUserMessages } from "@/utils/api";
import { useAuth } from "@/contexts/authcontext";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import React from "react";
import { useLocale } from "next-intl";

const loadingContent = (
  <li
    className={`p-4 flex items-center bg-base-100 hover:bg-primary/50 active:bg-primary/80 focus:bg-primary/50 touch-active:bg-primary/50`}
    onTouchStart={(e) => e.currentTarget.classList.add("bg-primary/50")}
    onTouchEnd={(e) => e.currentTarget.classList.remove("bg-primary/50")}
    onTouchCancel={(e) => e.currentTarget.classList.remove("bg-primary/50")}
  >
    <div className="skeleton skeleton-animated h-12 w-12 shrink-0 rounded-full"></div>
    <div className="ml-4 flex-1">
      <div className="skeleton skeleton-animated h-3 w-16"></div>
      <div className="mt-2 skeleton skeleton-animated h-3 w-16"></div>
    </div>
    <div className="text-xs text-base-500 ml-4 self-start">
      <div className="skeleton skeleton-animated h-3 w-16"></div>
    </div>
  </li>
);

export default function MessagesPage() {
  const [conversations, setConversations] = useState([]);
  const { user, accessToken } = useAuth();
  const t = useTranslations("Messages");
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const locale = useLocale();

  function getRelativeTime(date) {
    const now = new Date();
    const diff = Math.floor((now - new Date(date)) / 1000);

    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} h`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)} j`;
    return new Date(date).toLocaleDateString(locale);
  }

  useEffect(() => {
    if (!user || !user.id) {
      setLoading(false);
      return;
    }
    async function loadMessages() {
      try {
        const apiResult = await fetchUserMessages(accessToken);
        const conversationsArray = Array.isArray(apiResult)
          ? apiResult
          : apiResult.conversations || [];
        const formattedConversations = await Promise.all(
          conversationsArray.map(async (conv) => {
            const userProfile = await fetchUserProfile(conv.user);
            const lastMessageObj = conv.lastMessage || {};
            let lastMessageText = lastMessageObj.content || "";
            if (lastMessageObj.sender === user.id) {
              lastMessageText = `Vous: ${lastMessageObj.content || ""}`;
            }
            return {
              id: conv.user,
              user: userProfile,
              username: userProfile.username,
              lastMessage: lastMessageText,
              time: lastMessageObj.createdAt
                ? getRelativeTime(lastMessageObj.createdAt)
                : "",
              unread: lastMessageObj.isRead === false,
            };
          })
        );
        setConversations(formattedConversations);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      }
    }
    loadMessages();
  }, [accessToken, user?.id]);

  return (
    <div className="flex flex-col bg-base-100">
      {/* Header */}
      <div className="p-4 bg-base-100 shadow flex items-center">
        <h1 className="text-xl font-bold flex-1">{t("title")}</h1>
        <button
          className="btn btn-square btn-primary"
          aria-label="Nouveau message"
          onClick={() => router.push("/messages/new")}
        >
          <span className="icon-[tabler--edit] size-6 text-base-content"></span>
        </button>
      </div>

      {/* Liste des conversations */}
      <main className="flex-1 overflow-auto">
        <ul className="divide-y divide-base-content/30">
          {loading &&
            Array.from({ length: 3 }).map((_, i) => (
              <React.Fragment key={i}>{loadingContent}</React.Fragment>
            ))}
          {!loading && conversations.length === 0 && (
            <li className="p-4 text-base-content/80">{t("noMessages")}</li>
          )}
          {!loading &&
            conversations.map((conv) => (
              <li
                key={conv.id}
                className={`p-4 flex items-center bg-base-100 hover:bg-primary/50 active:bg-primary/80 focus:bg-primary/50 touch-active:bg-primary/50 ${
                  conv.unread ? "font-semibold" : "font-normal"
                }`}
                onClick={() => router.push(`/messages/${conv.id}`)}
                tabIndex={0}
                onKeyPress={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    router.push(`/messages/${conv.id}`);
                  }
                }}
                onTouchStart={(e) =>
                  e.currentTarget.classList.add("bg-primary/50")
                }
                onTouchEnd={(e) =>
                  e.currentTarget.classList.remove("bg-primary/50")
                }
                onTouchCancel={(e) =>
                  e.currentTarget.classList.remove("bg-primary/50")
                }
              >
                <UserAvatar user={conv.user} link={false} size="gs" />
                <div className="ml-4 flex-1">
                  <p className="text-sm">{conv.username}</p>
                  <p className="mt-1 text-sm text-base-600 truncate">
                    {conv.lastMessage}
                  </p>
                </div>
                <div className="text-xs text-base-500 ml-4 self-start">
                  {conv.time}
                </div>
                {conv.unread && (
                  <span className="ml-2 w-2 h-2 bg-accent rounded-full" />
                )}
              </li>
            ))}
        </ul>
      </main>
    </div>
  );
}
