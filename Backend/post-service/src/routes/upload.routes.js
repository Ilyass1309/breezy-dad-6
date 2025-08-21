const express = require("express");
const router = express.Router();
const uploadController = require("../controllers/upload.controller");

// Route d'upload d'image pour les posts
router.post("/upload_post_image", uploadController.uploadPostImage);

module.exports = router;
