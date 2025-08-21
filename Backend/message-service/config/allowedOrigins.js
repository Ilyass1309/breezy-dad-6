const allowedOrigins = [
  process.env.AUTH_SERVICE_URL,
  process.env.USER_SERVICE_URL,
  process.env.MESSAGE_SERVICE_URL,
  process.env.NOTIFICATION_SERVICE_URL,
  process.env.POST_SERVICE_URL,
  "https://breezy-dad-6-dlsz.vercel.app",
].filter(Boolean);

module.exports = allowedOrigins;
