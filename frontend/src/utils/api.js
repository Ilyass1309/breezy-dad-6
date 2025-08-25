// =========================
// api.js (front, Next.js)
// =========================

// --- URLs des microservices (vars d'env publiques côté Vercel) ---
const AUTH_SERVICE_URL =
  process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || "https://breezy-dad-6.onrender.com";
const USER_SERVICE_URL =
  process.env.NEXT_PUBLIC_USER_SERVICE_URL || "https://user-service-82ui.onrender.com";
const POST_SERVICE_URL =
  process.env.NEXT_PUBLIC_POST_SERVICE_URL || "https://post-service-tmsc.onrender.com";
const MESSAGE_SERVICE_URL =
  process.env.NEXT_PUBLIC_MESSAGE_SERVICE_URL || "https://message-service-cpmd.onrender.com";
const NOTIFICATION_SERVICE_URL =
  process.env.NEXT_PUBLIC_NOTIFICATION_SERVICE_URL || "https://notification-service-mrpo.onrender.com";

import axios from "axios";
import Cookies from "js-cookie";

// === Bindings pour propager le token & faire un logout global ===
let setAccessTokenFromApi = null;
export const bindAuthContext = (setAccessToken) => {
  setAccessTokenFromApi = setAccessToken;
};

let logoutAPI = null;
export const bindLogout = (logout) => {
  logoutAPI = logout;
};

// === Config commune ===
const baseConfig = {
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // utile si refreshToken httpOnly
  timeout: 25000,
};

// === Fabrique d'un client axios avec header Authorization auto ===
const makeClient = (baseURL) => {
  const client = axios.create({ baseURL, ...baseConfig });

  client.interceptors.request.use(
    (req) => {
      const accessToken = Cookies.get("accessToken");
      if (accessToken) {
        console.log("[API] accessToken utilisé:", accessToken);
        req.headers["Authorization"] = `Bearer ${accessToken}`;
      } else {
        console.log("[API] Aucun accessToken trouvé dans les cookies");
      }
      return req;
    },
    (err) => Promise.reject(err)
  );

  return client;
};

// === Clients par service ===
const authClient  = makeClient(AUTH_SERVICE_URL);
const userClient  = makeClient(USER_SERVICE_URL);
const postClient  = makeClient(POST_SERVICE_URL);
const msgClient   = makeClient(MESSAGE_SERVICE_URL);
const notifClient = makeClient(NOTIFICATION_SERVICE_URL);

// === Intercepteur 401 → refresh sur auth-service ===
const attachRefreshInterceptor = (client) => {
  client.interceptors.response.use(
    (res) => res,
    async (error) => {
      const original = error.config || {};
      if (error.response?.status === 401 && !original._retry) {
        original._retry = true;
        try {
          // Appel direct au service d'auth pour rafraîchir
          const { data } = await authClient.post("/api/auth/refresh-token", {}, baseConfig);
          const newAccessToken = data?.accessToken;

          if (newAccessToken) {
            setAccessTokenFromApi?.(newAccessToken);
            original.headers = original.headers || {};
            original.headers["Authorization"] = `Bearer ${newAccessToken}`;
          }
          return client(original);
        } catch (e) {
          console.error("Token refresh failed:", e);
          logoutAPI?.();
          if (typeof window !== "undefined") window.location.href = "/";
          return Promise.reject(e);
        }
      }
      return Promise.reject(error);
    }
  );
};

[authClient, userClient, postClient, msgClient, notifClient].forEach(attachRefreshInterceptor);

// =====================
//        AUTH
// =====================

export async function registerUser(email, username, password) {
  const { data } = await authClient.post("/api/auth/register", { email, username, password });
  return data; // { msg, accessToken }
}

export async function loginUser(identifier, password) {
  const { data } = await authClient.post("/api/auth/login", { identifier, password });
  return data; // { accessToken, ... }
}

// =====================
//        USERS
// =====================

export async function fetchUserProfile(identifier) {
  console.log('[API] fetchUserProfile appelé avec identifier:', identifier);
  const res = await userClient.get(`/api/users/${identifier}`);
  console.log('[API] fetchUserProfile réponse:', res.data);
  return res.data;
}

export async function fetchUserFollowing(userId) {
  const res = await userClient.get(`/api/users/${userId}/following`);
  return res.data;
}

export async function fetchUserFollowers(userId) {
  const res = await userClient.get(`/api/users/${userId}/followers`);
  return res.data;
}

export async function fetchUserFriends(userId, token) {
  const res = await userClient.get(`/api/users/${userId}/friends`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function fetchUsersByUsername(query) {
  const res = await userClient.get(`/api/users/search`, { params: { query } });
  return res.data;
}

export async function followUser(targetUserId) {
  const res = await userClient.post(`/api/friend-requests/follow/${targetUserId}`, {});
  return res.data;
}

export async function unfollowUser(targetUserId) {
  const res = await userClient.post(`/api/friend-requests/unfollow/${targetUserId}`, {});
  return res.data;
}

export async function updateUserProfile(bio, avatar, token) {
  const res = await userClient.patch(
    `/api/users/`,
    { bio, avatar },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
}

// =====================
//        POSTS
// =====================

export async function fetchUserPosts(userId) {
  const res = await postClient.get(`/api/posts/byuser/${userId}`);
  return res.data;
}

export async function fetchUserFeed() {
  const res = await postClient.get(`/api/posts/feed`);
  return res.data;
}

export async function fetchFYP() {
  const res = await postClient.get(`/api/posts/fyp`);
  return res.data;
}
/*
export async function postBreeze(text, tags, image) {
  const res = await postClient.post(`/api/posts/`, { content: text, tags, image });
  return res.data;
}*/

export async function postBreeze(text, tags, imageUrl) {
  // On envoie mediaUrls comme tableau si imageUrl existe, sinon tableau vide
  const mediaUrls = imageUrl ? [imageUrl] : [];
  const res = await postClient.post(`/api/posts/`, { content: text, tags, mediaUrls });
  return res.data;
}

export async function likeBreeze(setLiked, postID, token) {
  const path = setLiked
    ? `/api/posts/likes/posts/${postID}/like`
    : `/api/posts/likes/posts/${postID}/unlike`;
  const res = await postClient.post(path, {}, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
}

export async function fetchTaggedPosts(tag) {
  const res = await postClient.get(`/api/posts/search/popular`, { params: { tag } });
  return res.data;
}

export async function fetchPost(postId) {
  const res = await postClient.get(`/api/posts/${postId}`);
  return res.data;
}

export async function fetchPostComments(postId) {
  const res = await postClient.get(`/api/posts/${postId}/comments`);
  return res.data;
}

export async function addCommentToPost(postId, comment_content) {
  const res = await postClient.post(`/api/posts/${postId}/comments`, { content: comment_content });
  return res;
}

export async function updateComment(postId, commentId, new_content) {
  const res = await postClient.put(`/api/posts/${postId}/comments/${commentId}`, { content: new_content });
  return res;
}

export async function deleteComment(postId, commentId) {
  const res = await postClient.delete(`/api/posts/${postId}/comments/${commentId}`);
  return res;
}

export async function getCommentReplies(postId, commentId) {
  const res = await postClient.get(`/api/posts/${postId}/comments/${commentId}/replies`);
  return res.data;
}

export async function getCommentRepliesCount(postId, commentId) {
  const res = await postClient.get(`/api/posts/${postId}/comments/${commentId}/repliesCount`);
  return res;
}

export async function likeComment(commentId) {
  const res = await postClient.post(`/api/posts/likes/comments/${commentId}/like`, {});
  return res.data;
}

export async function unlikeComment(commentId) {
  const res = await postClient.post(`/api/posts/likes/comments/${commentId}/unlike`, {});
  return res.data;
}

// =====================
//      MESSAGES
// =====================

export async function fetchUserMessages() {
  const res = await msgClient.get(`/api/messages/inbox`);
  return res.data;
}

export async function fetchMessageById(messageId) {
  const res = await msgClient.get(`/api/messages/${messageId}`);
  return res.data;
}

export async function sendMessage(receiverId, content) {
  const res = await msgClient.post(`/api/messages/send`, { receiver: receiverId, content });
  return res.data;
}

export async function getConversations(userId) {
  const res = await msgClient.get(`/api/messages/conversations/${userId}`);
  return res.data;
}

export async function deleteMessage(messageId) {
  const res = await msgClient.delete(`/api/messages/${messageId}`);
  return res.data;
}

export async function editMessage(messageId, content) {
  const res = await msgClient.patch(`/api/messages/${messageId}`, { content });
  return res.data;
}

export async function markConversationAsRead(userId, token) {
  return msgClient.post(
    `/api/messages/conversations/${userId}/read`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

// =====================
//   NOTIFICATIONS
// =====================

export async function fetchNotifications(token) {
  const res = await notifClient.get(`/api/notifications`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function getNotificationCount(token) {
  const res = await notifClient.get(`/api/notifications/count`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function readAndUpdateNotification(notificationId, token) {
  const res = await notifClient.patch(
    `/api/notifications/${notificationId}`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
}

export async function readAndDeleteNotification(notificationId, token) {
  const res = await notifClient.delete(`/api/notifications/${notificationId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

// Pour followers (user-service)
export async function setFollowersCount(userId, count) {
  await userClient.post(`/api/admin/set-followers`, { userId, count });
}

// Pour likes (post-service)
export async function setLikesCount(postId, count) {
  await postClient.post(`/api/admin/set-likes`, { postId, count });
}
