import { useAuth } from "@/contexts/authcontext";
import {
  fetchUserProfile,
  followUser,
  unfollowUser,
  fetchUserFollowing,
} from "@/utils/api";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import UserAvatar from "./UserAvatar";
import { useTranslations } from "next-intl";

export default function ProfileCard({ user, full = false }) {
  const t = useTranslations("profileCard");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("not-following");

  const { user: myUser, accessToken } = useAuth();

  const [userProfile, setUserProfile] = useState(user);

  const router = useRouter();
  useEffect(() => {
    setUserProfile(user);
    if (!user) {
      setLoading(true);
      setError("Utilisateur introuvable");
      return;
    }
    if (user?.username) {
      setTimeout(() => {
        setLoading(false);
        setError(null);
      }, 1000);
    } else {
      setLoading(true);
      setError("Chargement du profil...");
    }
  }, [user]);

  const loadingContent = (
    <div className="flex w-52 flex-col gap-4">
      <div className="flex items-center gap-4">
        <div className="skeleton skeleton-animated h-16 w-16 shrink-0 rounded-full"></div>
        <div className="flex flex-col gap-4">
          <div className="skeleton skeleton-animated h-4 w-20"></div>
          <div className="skeleton skeleton-animated h-4 w-28"></div>
          <div className="skeleton skeleton-animated h-4 w-28"></div>
        </div>
      </div>
    </div>
  );

  useEffect(() => {
    setLoading(true);
    setError(null);
    const fetchProfile = async () => {
      try {
        if (!full) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
        setError(null);

        // Charger le statut de suivi
        if (myUser && user && user.id !== myUser.id) {
          try {
            const followings = await fetchUserFollowing(myUser.id);
            let list = [];
            if (Array.isArray(followings)) {
              list = followings;
            } else if (Array.isArray(followings?.following)) {
              list = followings.following;
            } else if (Array.isArray(followings?.data)) {
              list = followings.data;
            }
            if (list.some((u) => u._id === user.id)) {
              setStatus("following");
            } else {
              setStatus("not-following");
            }
          } catch (err) {
            console.error("Erreur lors du fetchUserFollowing:", err);
            setStatus("not-following");
          }
        }
      } catch (err) {
        setError("Erreur lors de la récupération du profil");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [myUser, user, userProfile]);

  async function handleFollowClick() {
    if (!user) return;
    try {
      if (status === "not-following") {
        await followUser(user.id, accessToken);
        setStatus("following");
      } else if (status === "following") {
        await unfollowUser(user.id, accessToken);
        setStatus("not-following");
      }
      const updatedUser = await fetchUserProfile(user.id);
      setUserProfile(updatedUser);
    } catch (err) {
      setError("Erreur lors du suivi/désabonnement");
    }
  }

  return (
    <>
      {loading ? (
        loadingContent
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : !userProfile ? (
        <div className="text-red-500"> {t("userNotFound")} </div>
      ) : (
        <div className="flex items-center gap-4">
          <UserAvatar user={userProfile} size="md" />
          <div className="flex flex-col gap-2 flex-1">
            <div>
              <Link
                className="h-4 w-20 text-lg font-semibold text-base-content"
                href={`/profile/${userProfile.username}`}
              >
                {userProfile?.username}
              </Link>
              {full && userProfile.bio && (
                <p className="text-base-content text-sm">{userProfile.bio}</p>
              )}
            </div>
            <div className="h-4 w-28 text-base-content/80">
              <span className="text-base-content font-semibold">
                {userProfile?.followingCount}
              </span>{" "}
              {t("following")}
            </div>
            <div className="h-4 w-28 text-base-content/80">
              <span className="text-base-content font-semibold">
                {userProfile?.followersCount}
              </span>{" "}
              {t("followers")}
            </div>
          </div>
          {/* Bouton suivre/désabonner à droite */}
          {full && userProfile.id && myUser && userProfile.id !== myUser.id && (
            <button
              className={`btn btn-primary px-4 py-1 font-semibold ml-auto ${
                status === "following" ? "btn-outline" : ""
              }`}
              onClick={handleFollowClick}
            >
              {status === "following" ? "Abonné" : "Suivre"}
            </button>
          )}
        </div>
      )}
    </>
  );
}
