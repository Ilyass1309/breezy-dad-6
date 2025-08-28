exports.health = (req, res) => {
  res.status(200).json({ status: 'ok', service: 'user', time: Date.now() });
};

exports.legacyHealth = (req, res) => {
  res.status(200).json({ status: 'ok', service: 'user', legacy: true });
};
