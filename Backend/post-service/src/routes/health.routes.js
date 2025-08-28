const router = require('express').Router();
const { health, legacyHealth } = require('../controllers/health.controller');

router.get('/health', health);
router.get('/api/health', legacyHealth);

module.exports = router;
