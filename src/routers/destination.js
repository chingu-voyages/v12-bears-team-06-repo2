const express = require('express');
const fetch = require('node-fetch');
const auth = require('../middleware/auth');

const router = new express.Router();

router.get('/destination', auth, async (req, res) => {
  try {
    if(!req.query.address) {
      return res.status(400).send({
        error: 'You must provide an address.'
      });
    }

    if(req.query.address === 'undefined') {
      return res.send();
    }

    if(req.user.destination !== req.query.address){
      req.user.destination = req.query.address;
      await req.user.save();
    }

    const geocodeURL = `https://eu1.locationiq.com/v1/search.php?key=${process.env.GEOCODE_API_KEY}&q=${encodeURIComponent(req.query.address)}&format=json&limit=1`;
    fetch(geocodeURL)
      .then(res => res.json())
      .then(json => {
        const data = {
          longitude: json[0].lon,
          latitude: json[0].lat,
          location: json[0].display_name
        };
        const forecastURL = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${data.latitude},${data.longitude}?units=si&exclude=[minutely,hourly,alerts,flags]`;
        fetch(forecastURL)
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
            const attractionsURL = `https://api.sygictravelapi.com/1.1/en/places/list?location=${data.latitude},${data.longitude}&level=poi&limit=10`;
            fetch(attractionsURL, {
              method: 'GET',
              headers: {
                'x-api-key': process.env.ATTRACTIONS_API_KEY
              }})
              .then(res => res.json())
              .then(json => {
                let attractions = [];
                for (let i = 0; i < 10; i++) {
                  const name = json.data.places[i].name;
                  const img = json.data.places[i].thumbnail_url;
                  const url = json.data.places[i].url;
                  attractions.push({name, img, url});
                }
                  res.send({
                    location: data.location,
                    latitude: data.latitude,
                    longitude: data.longitude,
                    forecast: forecast,
                    attractions: attractions
                  });
            }).catch(err => res.status(400).send(err));
        }).catch(err => res.status(400).send(err));
    }).catch(err => res.status(400).send(err));
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
});

module.exports = router;
