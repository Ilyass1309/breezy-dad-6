const router = require('express').Router();
const { health, legacyHealth, warmup } = require('../controllers/health.controller');

// Root health
router.get('/health', health);
// Legacy path under /api
router.get('/api/health', legacyHealth);
// Aggregated warmup
router.get('/warmup', warmup);

module.exports = router;
