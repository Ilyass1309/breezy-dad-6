// Health & warmup controller for auth-service
// Exposes: health, legacyHealth, warmup (aggregates other services)

const axios = require('axios');

const SERVICES = [
  { name: 'auth', urlEnv: 'AUTH_URL', fallback: 'https://breezy-dad-6.onrender.com/health' },
  { name: 'user', urlEnv: 'USER_URL', fallback: 'https://user-service-82ui.onrender.com/health' },
  { name: 'post', urlEnv: 'POST_URL', fallback: 'https://post-service-tmsc.onrender.com/health' },
  { name: 'message', urlEnv: 'MESSAGE_URL', fallback: 'https://message-service-cpmd.onrender.com/health' },
  { name: 'notification', urlEnv: 'NOTIF_URL', fallback: 'https://notification-service-mrpo.onrender.com/health' },
];

exports.health = (req, res) => {
  res.status(200).json({ status: 'ok', service: 'auth', time: Date.now() });
};

exports.legacyHealth = (req, res) => {
  res.status(200).json({ status: 'ok', service: 'auth', legacy: true });
};

exports.warmup = async (req, res) => {
  const fastMode = req.query.fast === '1' || req.query.mode === 'fast';
  const timeoutMs = parseInt(process.env.WARMUP_TIMEOUT_MS || '6000', 10);
  const services = SERVICES.map(s => ({
    name: s.name,
    url: process.env[s.urlEnv] ? ensureHealthPath(process.env[s.urlEnv]) : s.fallback
  }));

  const started = Date.now();

  if (fastMode) {
    return res.status(200).json({
      status: 'ok',
      mode: 'fast',
      services: [],
      timestamp: new Date().toISOString()
    });
  }

  const results = await Promise.allSettled(
    services.map(async (s) => {
      const t0 = Date.now();
      try {
        const resp = await axios.get(s.url, { timeout: timeoutMs, validateStatus: () => true, headers: { 'User-Agent': 'breezy-warmup/1.0' } });
        let body = '';
        if (resp.data && typeof resp.data === 'object') {
          body = JSON.stringify(resp.data).slice(0, 200);
        } else if (typeof resp.data === 'string') {
          body = resp.data.slice(0, 200);
        }
        return {
          name: s.name,
          url: s.url,
          statusCode: resp.status,
          ok: resp.status >= 200 && resp.status < 400,
          latencyMs: Date.now() - t0,
          body
        };
      } catch (e) {
        return {
          name: s.name,
          url: s.url,
            ok: false,
          error: e.code || e.message,
          latencyMs: Date.now() - t0,
        };
      }
    })
  );

  const normalized = results.map(r => r.status === 'fulfilled' ? r.value : { ok: false, error: r.reason?.message || 'unknown', name: 'unknown' });
  const allOk = normalized.every(r => r.ok);
  const partial = !allOk && normalized.some(r => r.ok);
  res.status(allOk ? 200 : (partial ? 207 : 503)).json({
    status: allOk ? 'ok' : (partial ? 'partial' : 'down'),
    totalLatencyMs: Date.now() - started,
    timeoutPerServiceMs: timeoutMs,
    services: normalized,
    timestamp: new Date().toISOString()
  });
};

function ensureHealthPath(base) {
  if (base.endsWith('/health')) return base;
  return base.replace(/\/$/, '') + '/health';
}
