require('dotenv').config({path: '../.env'});
const fetch = require('node-fetch');

const forecast = (latitude, longitude, callback) => {
  const url = 'https://api.darksky.net/forecast/' + process.env.WEATHER_API_KEY + '/' + latitude + ',' + longitude + '?units=si&exclude=[minutely,hourly,alerts,flags]';
  fetch(url)
    .then(res => res.json())
    .then(json => {
      let forecast = [];
      for (let i = 0; i < 5; i++) {
        const today = new Date();
        today.setDate(today.getDate() + i);
        const date = JSON.stringify(today).slice(1,11);
        const icon = json.daily.data[i].icon;
        const tempHigh = json.daily.data[i].temperatureHigh;
        const tempLow = json.daily.data[i].temperatureLow;
        forecast.push({date, icon, tempHigh, tempLow});
      }
      callback(undefined, forecast);
    }
    )
    .catch(err => callback('Something went wrong.', undefined));
  };

module.exports = forecast;
