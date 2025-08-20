"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import UserAvatar from "@/components/UserAvatar";
import {
  sendMessage,
  getConversations,
  fetchUserProfile,
  markConversationAsRead,
} from "@/utils/api";
import { useAuth } from "@/contexts/authcontext";
import socket from "@/utils/socket";
import { useTranslations } from "next-intl";
export default function ConversationPage() {
  const t = useTranslations("Conversation");
  const { userId: conversationId } = useParams();
  const router = useRouter();
  const { user, accessToken } = useAuth();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  // On connecte le socket avec l'userId de la conversation
  useEffect(() => {
    if (!user?.id) return;

    socket.connect();
    socket.emit("join", user.id);

    socket.on("newMessage", async (message) => {
      const isForThisChat =
        (message.sender === user.id && message.receiver === conversationId) ||
        (message.sender === conversationId && message.receiver === user.id);

      if (isForThisChat) {
        // Fetch sender profile if not me
        let senderProfile;
        if (message.sender === user.id) {
          senderProfile = user;
        } else {
          senderProfile = await fetchUserProfile(message.sender);
        }
        setMessages((prev) => [
          ...prev,
          {
            id: message._id,
            sender: message.sender,
            senderProfile: senderProfile,
            content: message.content,
            timestamp: new Date(message.createdAt),
          },
        ]);
      }
    });

    return () => {
      socket.off("newMessage");
      socket.disconnect();
    };
  }, [user?.id, conversationId]);

  useEffect(() => {
    const navbars = document.querySelectorAll(".navbar");
    navbars.forEach((nav) => {
      nav.classList.add("hidden");
    });
  }, []);

  useEffect(() => {
    function updateBodyScrollLock() {
      const isPortrait = window.matchMedia("(orientation: portrait)").matches;
      const isMobile = window.innerWidth <= 768;
      const navbars = document.querySelectorAll(".navbar");
      if (isPortrait && isMobile) {
        navbars.forEach((nav) => nav.classList.add("hidden"));
        setTimeout(() => {
          document.body.style.overflow = "hidden";
          window.scrollTo({
            top: document.body.scrollHeight,
            behavior: "auto",
          });
        }, 100);
      } else {
        document.body.style.overflow = "auto";
        navbars.forEach((nav) => nav.classList.remove("hidden"));
      }
    }
    updateBodyScrollLock();
    window.addEventListener("resize", updateBodyScrollLock);
    window.addEventListener("orientationchange", updateBodyScrollLock);
    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("resize", updateBodyScrollLock);
      window.removeEventListener("orientationchange", updateBodyScrollLock);
    };
  }, []);

  useEffect(() => {
    if (!accessToken || !conversationId) return;

    (async () => {
      try {
        const conv = await getConversations(conversationId, accessToken);

        if (!conv) {
          setMessages([]);
          return;
        }

        // Fetch user profiles for all unique senders
        const uniqueSenderIds = [...new Set(conv.map((msg) => msg.sender))];
        const senderProfiles = {};
        await Promise.all(
          uniqueSenderIds.map(async (id) => {
            senderProfiles[id] = await fetchUserProfile(id);
          })
        );

        const formattedConv = conv.map((msg) => {
          return {
            id: msg._id,
            sender: msg.sender,
            senderProfile: senderProfiles[msg.sender],
            content: msg.content,
            timestamp: new Date(msg.createdAt),
          };
        });

        setMessages(formattedConv);

        // On récupère les messages de la conversation
      } catch (err) {
        console.error("Failed to load conversation:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [accessToken, conversationId]);

  // scroll en bas à chaque changement
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    const text = newMessage.trim();
    if (!text) return;

    try {
      await sendMessage(conversationId, text, accessToken);
      setNewMessage("");
    } catch (err) {
      console.error("Envoi échoué :", err);
    }
  }

  useEffect(() => {
    if (conversationId && accessToken) {
      markConversationAsRead(conversationId, accessToken);
    }
  }, [conversationId, accessToken]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-base-200">
      {/* Header */}
      <header className="flex items-center border-b bg-base-100 px-4 py-3">
        <button
          onClick={() => {
            // Ré-affiche les navbars avant de naviguer
            document
              .querySelectorAll(".navbar")
              .forEach((nav) => nav.classList.remove("hidden"));
            router.push("/messages");
          }}
          className="btn btn-text btn-square mr-3"
        >
          <span className="icon-[tabler--arrow-left] size-6" />
        </button>
        <h2 className="text-lg font-semibold">{t("title")}</h2>
      </header>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages
          .slice() // copie pour ne pas muter l'état
          .sort((a, b) => a.timestamp - b.timestamp) // tri du plus ancien au plus récent
          .map((msg) => {
            const isMe = msg.sender === user.id;
            return (
              <div
                key={msg.id}
                className={`flex gap-2 items-center ${
                  isMe ? "justify-end" : "justify-start"
                }`}
              >
                {!isMe && (
                  <UserAvatar
                    user={msg.senderProfile}
                    size="sm"
                    className="mr-2 self-end"
                    link={false}
                  />
                )}
                <div
                  className={[
                    "max-w-[70%] px-4 py-2 rounded-2xl shadow-sm",
                    isMe
                      ? "bg-primary text-primary-content rounded-br-none"
                      : "bg-base-100 text-base-content rounded-bl-none",
                  ].join(" ")}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <div className="mt-1 text-right text-xs text-gray-400">
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        <div ref={bottomRef} />
      </div>
      {/* Barre de saisie */}
      <div className="flex items-center border-t bg-base-100 px-4 py-2 gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder={t("messagePlaceholder")}
          className="flex-1 rounded-full border px-4 py-2 focus:border-accent focus:outline-none"
        />
        <button
          onClick={handleSend}
          className="btn btn-square bg-primary p-2 text-base-content border-none"
        >
          <span className="icon-[tabler--send] size-5" />
        </button>
      </div>
    </div>
  );
}
