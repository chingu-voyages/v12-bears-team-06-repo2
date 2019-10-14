const express = require('express');
const geocode = require('../utils/geocode');
const forecast = require('../utils/forecast');

const router = new express.Router();

router.get('/weather', (req, res) => {
  try {
    if(!req.query.address) {
      return res.status(400).send({
        error: 'You must provide an address.'
      });
    }
    geocode(req.query.address, (error, {latitude, longitude, location}) => {
      if (error) {
        return res.status(400).send({err});
      }
      forecast(latitude, longitude, (error, forecastData) => {
        if (error) {
          return res.status(400).send({error});
        }
        res.send({
          location: location,
          forecast: forecastData
        });
      });
    });
  } catch (err) {
    res.status(400).send(err);
  }

});

module.exports = router;
