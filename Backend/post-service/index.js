require("dotenv").config();

const mongoose = require("mongoose");
const express = require("express");
const { logger } = require("./src/middlewares/logger");
const swaggerDocs = require("./utils/swagger");
const cors = require("cors");
const cookieParser = require('cookie-parser');

const app = express();
const port = 3003;

const corsOptions = require('./config/corsOptions');
app.use(cors(corsOptions));
app.use(express.json());
// Parse cookies so verifyJWT can read accessToken
app.use(cookieParser());
app.use(logger);
// Health routes
app.use('/', require('./src/routes/health.routes'));
swaggerDocs(app, port);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
  // log removed

    app.use("/api/posts", require("./src/routes/post.routes.js"));
    app.use(
      "/api/posts/:post_id/comments",
      require("./src/routes/comment.routes.js")
    );
    app.use(
      "/api/posts/likes",
      require("./src/routes/like.routes.js")
    );
    app.use("/api/upload", require("./src/routes/upload.routes.js"));
    app.use('/api/admin', require('./src/routes/admin.routes'));

    app.listen(port, () => {
  // log removed
    });
  })
  .catch((err) => {
  // log removed
    app.use("/", (req, res) => {
      return res
        .status(500)
        .json({ message: "Service is not connected to database" });
    });

    app.listen(port, () => {
  // log removed
    });
  });