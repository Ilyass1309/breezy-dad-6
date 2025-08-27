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
        const refreshResp = await api.post("/auth/refresh-token", {}); 
        if (refreshResp?.data?.accessToken) {
          api.defaults.headers.common['Authorization'] = 'Bearer ' + refreshResp.data.accessToken;
        }
        return api(original);                       
      } catch (e) {
        logoutAPI?.(); 
        if (typeof window !== "undefined") window.location.href = "/";
        throw e;
      }
    }
    throw error;
  }
);

// =====================
//        AUTH
// =====================

export async function registerUser(email, username, password) {
  const { data } = await api.post("/auth/register", { email, username, password });
  return data; // { msg, accessToken }
}

export async function loginUser(identifier, password) {
  const { data } = await api.post("/auth/login", { identifier, password });
  return data; // { accessToken, ... }
}

// =====================
//        USERS
// =====================

export async function fetchUserProfile(identifier) {
  const res = await api.get(`/users/${identifier}`);
  return res.data;
}

export async function fetchUserFollowing(userId) {
  const res = await api.get(`/users/${userId}/following`);
  return res.data;
}

export async function fetchUserFollowers(userId) {
  const res = await api.get(`/users/${userId}/followers`);
  return res.data;
}

export async function fetchUserFriends(userId) {
  const res = await api.get(`/users/${userId}/friends`);
  return res.data;
}

export async function fetchUsersByUsername(query) {
  const res = await api.get(`/users/search`, { params: { query } });
  return res.data;
}

// Bulk minimal user info (id, username, avatar)
export async function fetchUsersBulkMinimal(ids=[]) {
  if (!Array.isArray(ids) || ids.length === 0) return [];
  const res = await api.get(`/users/bulk`, { params: { ids: ids.join(',') } });
  return res.data; // [{id, username, avatar}]
}

export async function followUser(targetUserId) {
  const res = await api.post(`/friend-requests/follow/${targetUserId}`, {});
  return res.data;
}

export async function unfollowUser(targetUserId) {
  const res = await api.post(`/friend-requests/unfollow/${targetUserId}`, {});
  return res.data;
}

export async function updateUserProfile(bio, avatar) {
  const res = await api.patch(`/users/`, { bio, avatar });
  return res.data;
}

// =====================
//        POSTS
// =====================

export async function fetchFYPWithPagination(page = 1, limit = 8) {
  const res = await api.get(`/posts/fyp`, { params: { page, limit } });
  return res.data;
}

export async function fetchUserPosts(userId) {
  const res = await api.get(`/posts/byuser/${userId}`);
  return res.data;
}

export async function fetchUserFeed() {
  const res = await api.get(`/posts/feed`);
  return res.data;
}

export async function fetchFYP() {
  const res = await api.get(`/posts/fyp`);
  return res.data;
}

export async function postBreeze(text, tags, imageUrl) {
  // On envoie mediaUrls comme tableau si imageUrl existe, sinon tableau vide
  const mediaUrls = imageUrl ? [imageUrl] : [];
  const res = await api.post(`/posts/`, { content: text, tags, mediaUrls });
  return res.data;
}

export async function likeBreeze(setLiked, postID) {
  const path = setLiked
    ? `/posts/likes/posts/${postID}/like`
    : `/posts/likes/posts/${postID}/unlike`;
  const res = await api.post(path, {});
  return res.data;
}

export async function fetchTaggedPosts(tag) {
  const res = await api.get(`/posts/search/popular`, { params: { tag } });
  return res.data;
}

export async function fetchPost(postId) {
  const res = await api.get(`/posts/${postId}`);
  return res.data;
}

export async function fetchPostComments(postId) {
  const res = await api.get(`/posts/${postId}/comments`);
  return res.data;
}

export async function addCommentToPost(postId, comment_content) {
  const res = await api.post(`/posts/${postId}/comments`, { content: comment_content });
  return res;
}

export async function updateComment(postId, commentId, new_content) {
  const res = await api.put(`/posts/${postId}/comments/${commentId}`, { content: new_content });
  return res;
}

export async function deleteComment(postId, commentId) {
  const res = await api.delete(`/posts/${postId}/comments/${commentId}`);
  return res;
}

export async function getCommentReplies(postId, commentId) {
  const res = await api.get(`/posts/${postId}/comments/${commentId}/replies`);
  return res.data;
}

export async function getCommentRepliesCount(postId, commentId) {
  const res = await api.get(`/posts/${postId}/comments/${commentId}/repliesCount`);
  return res;
}

export async function likeComment(commentId) {
  const res = await api.post(`/posts/likes/comments/${commentId}/like`, {});
  return res.data;
}

export async function unlikeComment(commentId) {
  const res = await api.post(`/posts/likes/comments/${commentId}/unlike`, {});
  return res.data;
}

// =====================
//      MESSAGES
// =====================

export async function fetchUserMessages() {
  const res = await api.get(`/messages/inbox`);
  return res.data;
}

export async function fetchMessageById(messageId) {
  const res = await api.get(`/messages/${messageId}`);
  return res.data;
}

export async function sendMessage(receiverId, content) {
  const res = await api.post(`/messages/send`, { receiver: receiverId, content });
  return res.data;
}

export async function getConversations(userId) {
  const res = await api.get(`/messages/conversations/${userId}`);
  return res.data;
}

export async function deleteMessage(messageId) {
  const res = await api.delete(`/messages/${messageId}`);
  return res.data;
}

export async function editMessage(messageId, content) {
  const res = await api.patch(`/messages/${messageId}`, { content });
  return res.data;
}

export async function markConversationAsRead(userId) {
  return api.post(`/messages/conversations/${userId}/read`, {});
}

// =====================
//   NOTIFICATIONS
// =====================

export async function fetchNotifications() {
  const res = await api.get(`/notifications`);
  return res.data;
}

export async function getNotificationCount() {
  const res = await api.get(`/notifications/count`);
  return res.data;
}

export async function readAndUpdateNotification(notificationId) {
  const res = await api.patch(`/notifications/${notificationId}`, {});
  return res.data;
}

export async function readAndDeleteNotification(notificationId) {
  const res = await api.delete(`/notifications/${notificationId}`);
  return res.data;
}

// Pour followers (user-service)
export async function setFollowersCount(userId, count) {
  await api.post(`/admin/set-followers`, { userId, count });
}

// Pour likes (post-service)
export async function setLikesCount(postId, count) {
  await api.post(`/admin/set-likes`, { postId, count });
}
