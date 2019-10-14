require('dotenv').config({path: '../.env'});
const fetch = require('node-fetch');

function geocode(address, callback) {
  const url = `https://eu1.locationiq.com/v1/search.php?key=${process.env.GEOCODE_API_KEY}&q=${encodeURIComponent(address)}&format=json&limit=1`;
  fetch(url)
    .then(res => res.json())
    .then(json => callback(undefined, {
      longitude: json[0].lon,
      latitude: json[0].lat,
      location: json[0].display_name
      })
    )
    .catch(err => callback('Something went wrong.', undefined));
}

module.exports = geocode;
