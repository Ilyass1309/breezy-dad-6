require("dotenv").config();

const mongoose = require("mongoose");
const express = require("express");
const swaggerDocs = require("./utils/swagger");
const userAuthRoutes = require("./src/routes/user-auth.routes");
const userFollowRoutes = require("./src/routes/user-follow.routes");
const friendRequestRoutes = require("./src/routes/friend-request.routes");
const adminRoutes = require('./src/routes/admin.routes');
const cookieParser = require('cookie-parser');

const app = express();
const corsOptions = require('./config/corsOptions');
const cors = require("cors");
app.use(cors(corsOptions));
const port = 3001;

app.use(express.json());
app.use(cookieParser());
// Health routes
app.use('/', require('./src/routes/health.routes'));
app.use("/api/users", userAuthRoutes);
app.use("/api/users", userFollowRoutes);
app.use("/api/friend-requests", friendRequestRoutes);
app.use('/api/admin', adminRoutes);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    app.listen(port, () => {
      swaggerDocs(app, port);
    });
  })
  .catch((err) => {
    // error suppressed
  });
