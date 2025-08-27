const allowedOrigins = [
    process.env.AUTH_SERVICE_URL,
    process.env.USER_SERVICE_URL,
    process.env.MESSAGE_SERVICE_URL,
    process.env.NOTIFICATION_SERVICE_URL,
    process.env.POST_SERVICE_URL,
    "https://breezy-dad-6-dlsz.vercel.app",
    "https://vercel.com/ilyass1309s-projects/breezy-dad-6-dlsz/5DtBoWWLsK9TGDDHyaqcJw6gfELY"
].filter(Boolean);

module.exports = allowedOrigins;
