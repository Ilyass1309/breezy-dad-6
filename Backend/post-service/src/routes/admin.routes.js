const express = require('express');
const router = express.Router();
const adminCtrl = require('../controllers/admin.controller');

// Route protégée à sécuriser en prod !
router.post('/set-likes', adminCtrl.setLikesCount);

module.exports = router;
