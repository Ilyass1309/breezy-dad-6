import axios from "axios";
import avatar from "flyonui/components/avatar";
import Cookies from "js-cookie";
import { use } from "react";

let setAccessTokenFromApi = null;
export const bindAuthContext = (setAccessToken) => {
  setAccessTokenFromApi = setAccessToken;
};

let logoutAPI = null;
export const bindLogout = (logout) => {
  logoutAPI = logout;
};

const config = {
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
};

const apiClient = axios.create({
  baseURL: "http://localhost:8080",
  timeout: 5000,
});

apiClient.interceptors.request.use(
  (request) => {
    const accessToken = Cookies.get("accessToken");
    if (accessToken) {
      request.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return request;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response, // Directly return successful responses.
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Mark the request as retried to avoid infinite loops.
      try {
        // Make a request to your auth server to refresh the token.
        const response = await apiClient.post(
          "/auth/refresh-token",
          {},
          config
        );
        const { accessToken: newAccessToken } = response.data;

        if (newAccessToken) {
          setAccessTokenFromApi(newAccessToken);
        }

        // Update the authorization header with the new access token.
        apiClient.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest); // Retry the original request with the new access token.
      } catch (refreshError) {
        // Handle refresh token errors by clearing stored tokens and redirecting to the login page.
        console.error("Token refresh failed:", refreshError);
        logoutAPI();
        window.location.href = "/";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error); // For all other errors, return the error as is.
  }
);

// —————————————
// Auth
// —————————————

// Inscription
export async function registerUser(email, username, password) {
  const { data } = await apiClient.post(
    "/register",
    {
      email,
      username,
      password,
    },
    config
  );
  return data; // { msg, accessToken }
}

// Connexion
export const loginUser = async (identifier, password) => {
  try {
    const response = await apiClient.post(
      "/login",
      {
        identifier,
        password,
      },
      config
    );
    return response.data;
  } catch (error) {
    //console.error("Erreur lors de la connexion :", error);
    throw error;
  }
};

export async function fetchUserProfile(identifier) {
  const res = await apiClient.get(`/api/users/${identifier}`);
  return res.data;
}

export async function fetchUserFollowing(userId) {
  const res = await apiClient.get(`/api/users/${userId}/following`);
  return res.data;
}

export async function fetchUserFollowers(userId) {
  const res = await apiClient.get(`/api/users/${userId}/followers`);
  return res.data;
}

export async function fetchUserFriends(userId, token) {
  const res = await apiClient.get(`/api/users/${userId}/friends`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}

export async function fetchUserPosts(userId, token) {
  const res = await apiClient.get(`/api/posts/byuser/${userId}`);
  return res.data;
}

export async function fetchUserFeed(token) {
  const res = await apiClient.get(`/api/posts/feed`);
  return res.data;
}

export async function fetchFYP() {
  const res = await apiClient.get(`/api/posts/fyp`);
  return res.data;
}

export async function followUser(targetUserId, token) {
  const res = await apiClient.post(
    `api/friend-requests/follow/${targetUserId}`,
    {}
  );
  return res.data;
}

export async function unfollowUser(targetUserId, token) {
  const res = await apiClient.post(
    `api/friend-requests/unfollow/${targetUserId}`,
    {}
  );
  return res.data;
}
export async function postBreeze(text, tags, image, token) {
  const res = await apiClient.post("/api/posts/", {
    content: text,
    tags: tags,
    image: image,
  });
  return res.data;
}

export async function likeBreeze(setLiked, postID, token) {
  const res = await apiClient.post(
    setLiked
      ? "/api/posts/likes/posts/" + postID + "/like"
      : "/api/posts/likes/posts/" + postID + "/unlike",
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
}

export async function fetchTaggedPosts(tag, token) {
  const res = await apiClient.get(`/api/posts/search/popular?tag=${tag}`);
  return res.data;
}

export async function fetchPost(postId, token) {
  const res = await apiClient.get(`/api/posts/${postId}`);
  return res.data;
}

export async function fetchUsersByUsername(query, token) {
  const res = await apiClient.get(`/api/users/search?query=${query}`);
  return res.data;
}

export async function fetchUserMessages(token) {
  const res = await apiClient.get("/messages/inbox");
  return res.data;
}

export async function fetchMessageById(messageId, token) {
  const res = await apiClient.get(`/messages/${messageId}`);
  return res.data;
}

export async function fetchPostComments(postId, token) {
  const res = await apiClient.get(`/api/posts/${postId}/comments`);
  return res.data;
}

export async function addCommentToPost(postId, comment_content, token) {
  const res = await apiClient.post(`/api/posts/${postId}/comments`, {
    content: comment_content,
  });
  return res;
}

export async function updateComment(postId, commentId, new_content, token) {
  const res = await apiClient.put(
    `/api/posts/${postId}/comments/${commentId}`,
    {
      content: new_content,
    }
  );
  return res;
}

export async function deleteComment(postId, commentId, token) {
  const res = await apiClient.delete(
    `/api/posts/${postId}/comments/${commentId}`
  );
  return res;
}

export async function getCommentReplies(postId, commentId, token) {
  const res = await apiClient.get(
    `/api/posts/${postId}/comments/${commentId}/replies`
  );
  return res.data;
}

export async function getCommentRepliesCount(postId, commentId, token) {
  const res = await apiClient.get(
    `/api/posts/${postId}/comments/${commentId}/repliesCount`
  );
  return res;
}

export async function addReplyToComment(
  postId,
  commentId,
  reply_content,
  reply_username,
  token
) {
  const res = await apiClient.post(
    `/api/posts/${postId}/comments/${commentId}/replies`,
    {
      content: reply_content,
      replyUsername: reply_username,
    }
  );
  return res;
}

export async function likeComment(commentId, token) {
  const res = await apiClient.post(
    `/api/posts/likes/comments/${commentId}/like`,
    {}
  );
  return res.data;
}

export async function unlikeComment(commentId, token) {
  const res = await apiClient.post(
    `/api/posts/likes/comments/${commentId}/unlike`,
    {}
  );
  return res.data;
}

export async function sendMessage(receiverId, content, token) {
  const res = await apiClient.post("/messages/send", {
    receiver: receiverId,
    content: content,
  });
  return res.data;
}

export async function getConversations(userId, token) {
  const res = await apiClient.get(`/messages/conversations/${userId}`);
  return res.data;
}

export async function deleteMessage(messageId, token) {
  const res = await apiClient.delete(`/messages/${messageId}`);
  return res.data;
}

export async function editMessage(messageId, content, token) {
  const res = await apiClient.patch(`/messages/${messageId}`, {
    content: content,
  });
  return res.data;
}

export async function updateUserProfile(bio, avatar, token) {
  const res = await apiClient.patch(
    `/api/users/`,
    {
      bio,
      avatar,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
}

export async function fetchNotifications(token) {
  const res = await apiClient.get("/api/notifications", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}

export async function getNotificationCount(token) {
  const res = await apiClient.get("/api/notifications/count", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}

export async function readAndUpdateNotification(notificationId, token) {
  const res = await apiClient.patch(
    `/api/notifications/${notificationId}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
}

export async function readAndDeleteNotification(notificationId, token) {
  const res = await apiClient.delete(`/api/notifications/${notificationId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}

export async function markConversationAsRead(userId, token) {
  return apiClient.post(
    `/messages/conversations/${userId}/read`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
}
