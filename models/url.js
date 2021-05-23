const mongoose = require('mongoose');
const Schema = new mongoose.Schema(
  {
    originalUrl: String,
    shortUrl: String
  }
);

module.exports = mongoose.model(
  "Url", Schema
);