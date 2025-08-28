const mongoose = require('mongoose');

exports.health = (req, res) => {
  res.status(200).json({ status: 'ok', service: 'post', dbReady: mongoose.connection.readyState === 1, time: Date.now() });
};

exports.legacyHealth = (req, res) => {
  res.status(200).json({ status: 'ok', service: 'post', legacy: true, dbReady: mongoose.connection.readyState === 1 });
};
