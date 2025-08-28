exports.health = (req, res) => {
  res.status(200).json({ status: 'ok', service: 'message', time: Date.now() });
};

exports.legacyHealth = (req, res) => {
  res.status(200).json({ status: 'ok', service: 'message', legacy: true });
};
