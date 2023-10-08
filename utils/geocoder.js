const NodeGeocoder = require('node-geocoder');
const options = {
  provider: process.env.GOECODE_PROVIDER,
  httpAdapter: 'https',
  apiKey: process.env.GOECODE_API_KEY,
  formatter: null,
};
const geocoder = NodeGeocoder(options);

module.exports = geocoder;
