const express = require('express');
const router = express.Router();
const adminCtrl = require('../controllers/admin.controller');

// Route protégée à sécuriser en prod !
router.post('/set-followers', adminCtrl.setFollowersCount);

module.exports = router;
