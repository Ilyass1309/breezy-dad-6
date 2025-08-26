import axios from "axios";

let logoutAPI = null;
export const bindLogout = (logout) => {
  logoutAPI = logout;
};

export const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  timeout: 30000,
});

// 401 -> tentative de refresh via /auth/refresh-token (cookie HttpOnly)
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config || {};
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const { data } = await api.post("/auth/refresh-token", {});
        const newAccess = data?.accessToken;
        if (newAccess) {
          setAccessToken(newAccess);
          original.headers = original.headers || {};
          original.headers.Authorization = `Bearer ${newAccess}`;
          return api(original);
        }
      } catch (e) {
        setAccessToken(null);
        if (typeof window !== "undefined") window.location.href = "/";
        return Promise.reject(e);
      }
    }
    return Promise.reject(error);
  }
);

// =====================
//        AUTH
// =====================

export async function registerUser(email, username, password) {
  const { data } = await authClient.post("/auth/register", { email, username, password });
  return data; // { msg, accessToken }
}

export async function loginUser(identifier, password) {
  const { data } = await authClient.post("/auth/login", { identifier, password });
  return data; // { accessToken, ... }
}

// =====================
//        USERS
// =====================

export async function fetchUserProfile(identifier) {
  console.log('[API] fetchUserProfile appelé avec identifier:', identifier);
  const res = await userClient.get(`/users/${identifier}`);
  console.log('[API] fetchUserProfile réponse:', res.data);
  return res.data;
}

export async function fetchUserFollowing(userId) {
  const res = await userClient.get(`/users/${userId}/following`);
  return res.data;
}

export async function fetchUserFollowers(userId) {
  const res = await userClient.get(`/users/${userId}/followers`);
  return res.data;
}

export async function fetchUserFriends(userId, token) {
  const res = await userClient.get(`/users/${userId}/friends`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function fetchUsersByUsername(query) {
  const res = await userClient.get(`/users/search`, { params: { query } });
  return res.data;
}

export async function followUser(targetUserId) {
  const res = await userClient.post(`/friend-requests/follow/${targetUserId}`, {});
  return res.data;
}

export async function unfollowUser(targetUserId) {
  const res = await userClient.post(`/friend-requests/unfollow/${targetUserId}`, {});
  return res.data;
}

export async function updateUserProfile(bio, avatar, token) {
  const res = await userClient.patch(
    `/users/`,
    { bio, avatar },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
}

// =====================
//        POSTS
// =====================

export async function fetchFYPWithPagination(page = 1, limit = 8) {
  const res = await postClient.get(`/posts/fyp`, { params: { page, limit } });
  return res.data;
}

export async function fetchUserPosts(userId) {
  const res = await postClient.get(`/posts/byuser/${userId}`);
  return res.data;
}

export async function fetchUserFeed() {
  const res = await postClient.get(`/posts/feed`);
  return res.data;
}

export async function fetchFYP() {
  const res = await postClient.get(`/posts/fyp`);
  return res.data;
}

export async function postBreeze(text, tags, imageUrl) {
  // On envoie mediaUrls comme tableau si imageUrl existe, sinon tableau vide
  const mediaUrls = imageUrl ? [imageUrl] : [];
  const res = await postClient.post(`/posts/`, { content: text, tags, mediaUrls });
  return res.data;
}

export async function likeBreeze(setLiked, postID, token) {
  const path = setLiked
    ? `/posts/likes/posts/${postID}/like`
    : `/posts/likes/posts/${postID}/unlike`;
  const res = await postClient.post(path, {}, { headers: { Authorization: `Bearer ${token}` } });
  return res.data;
}

export async function fetchTaggedPosts(tag) {
  const res = await postClient.get(`/posts/search/popular`, { params: { tag } });
  return res.data;
}

export async function fetchPost(postId) {
  const res = await postClient.get(`/posts/${postId}`);
  return res.data;
}

export async function fetchPostComments(postId) {
  const res = await postClient.get(`/posts/${postId}/comments`);
  return res.data;
}

export async function addCommentToPost(postId, comment_content) {
  const res = await postClient.post(`/posts/${postId}/comments`, { content: comment_content });
  return res;
}

export async function updateComment(postId, commentId, new_content) {
  const res = await postClient.put(`/posts/${postId}/comments/${commentId}`, { content: new_content });
  return res;
}

export async function deleteComment(postId, commentId) {
  const res = await postClient.delete(`/posts/${postId}/comments/${commentId}`);
  return res;
}

export async function getCommentReplies(postId, commentId) {
  const res = await postClient.get(`/posts/${postId}/comments/${commentId}/replies`);
  return res.data;
}

export async function getCommentRepliesCount(postId, commentId) {
  const res = await postClient.get(`/posts/${postId}/comments/${commentId}/repliesCount`);
  return res;
}

export async function likeComment(commentId) {
  const res = await postClient.post(`/posts/likes/comments/${commentId}/like`, {});
  return res.data;
}

export async function unlikeComment(commentId) {
  const res = await postClient.post(`/posts/likes/comments/${commentId}/unlike`, {});
  return res.data;
}

// =====================
//      MESSAGES
// =====================

export async function fetchUserMessages() {
  const res = await msgClient.get(`/messages/inbox`);
  return res.data;
}

export async function fetchMessageById(messageId) {
  const res = await msgClient.get(`/messages/${messageId}`);
  return res.data;
}

export async function sendMessage(receiverId, content) {
  const res = await msgClient.post(`/messages/send`, { receiver: receiverId, content });
  return res.data;
}

export async function getConversations(userId) {
  const res = await msgClient.get(`/messages/conversations/${userId}`);
  return res.data;
}

export async function deleteMessage(messageId) {
  const res = await msgClient.delete(`/messages/${messageId}`);
  return res.data;
}

export async function editMessage(messageId, content) {
  const res = await msgClient.patch(`/messages/${messageId}`, { content });
  return res.data;
}

export async function markConversationAsRead(userId, token) {
  return msgClient.post(
    `/messages/conversations/${userId}/read`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
}

// =====================
//   NOTIFICATIONS
// =====================

export async function fetchNotifications(token) {
  const res = await notifClient.get(`/notifications`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function getNotificationCount(token) {
  const res = await notifClient.get(`/notifications/count`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function readAndUpdateNotification(notificationId, token) {
  const res = await notifClient.patch(
    `/notifications/${notificationId}`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
}

export async function readAndDeleteNotification(notificationId, token) {
  const res = await notifClient.delete(`/notifications/${notificationId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

// Pour followers (user-service)
export async function setFollowersCount(userId, count) {
  await userClient.post(`/admin/set-followers`, { userId, count });
}

// Pour likes (post-service)
export async function setLikesCount(postId, count) {
  await postClient.post(`/admin/set-likes`, { postId, count });
}
