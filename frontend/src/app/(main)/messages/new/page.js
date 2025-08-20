"use client";

import { useAuth } from "@/contexts/authcontext";
import { fetchUserFriends, fetchUserProfile } from "@/utils/api";
import { useEffect, useState } from "react";
import React from "react";
import UserAvatar from "@/components/UserAvatar";
import { useTranslations } from "next-intl";

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
    </div>
  </li>
);

export default function NewMessagePage() {
  const t = useTranslations("NewMessagePage");
  const { user, accessToken } = useAuth();
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || !user.id) {
      setLoading(false);
      setFriends([]);
      return;
    }
    const fetchFriends = async () => {
      try {
        setLoading(true);
        const friendsListRaw = await fetchUserFriends(user.id, accessToken);
        if (!friendsListRaw || friendsListRaw.length === 0) {
          setFriends([]);
          return;
        }
        const friendsList = await Promise.all(
          friendsListRaw.map((friendId) => fetchUserProfile(friendId))
        );
        setFriends(friendsList);
      } catch (err) {
        setError(t("error"));
        setFriends([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFriends();
  }, [user?.id]);

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1 className="text-2xl font-bold mb-4 pt-4">{t("title")}</h1>
      <p className="text-gray-600 mb-6 px-4">{t("description")}</p>
      <ul className="w-full divide-y divide-base-content/30">
        {loading &&
          Array.from({ length: 3 }).map((_, i) => (
            <React.Fragment key={i}>{loadingContent}</React.Fragment>
          ))}
        {!loading && error && <li className="p-4 text-red-500">{error}</li>}
        {!loading && friends.length === 0 && (
          <li className="p-4 text-gray-500">{t("noFriends")}</li>
        )}
        {!loading &&
          friends.map((friend) => (
            <li
              key={friend.id}
              className={`p-4 flex items-center bg-base-100 hover:bg-primary/50 active:bg-primary/80 focus:bg-primary/50 touch-active:bg-primary/50`}
              onTouchStart={(e) =>
                e.currentTarget.classList.add("bg-primary/50")
              }
              onTouchEnd={(e) =>
                e.currentTarget.classList.remove("bg-primary/50")
              }
              onTouchCancel={(e) =>
                e.currentTarget.classList.remove("bg-primary/50")
              }
              onClick={() => {
                window.location.href = `/messages/${friend.id}`;
              }}
            >
              <div className="shrink-0">
                <UserAvatar user={friend} size="gs" />
              </div>
              <div className="ml-4 flex-1">
                <div className="text-lg font-semibold">{friend.username}</div>
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
}
