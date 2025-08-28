exports.health = (req, res) => {
  res.status(200).json({ status: 'ok', service: 'notification', time: Date.now() });
};

exports.legacyHealth = (req, res) => {
  res.status(200).json({ status: 'ok', service: 'notification', legacy: true });
};
