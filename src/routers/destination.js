const express = require('express');
const geocode = require('../utils/geocode');
const forecast = require('../utils/forecast');
const auth = require('../middleware/auth');

const router = new express.Router();

router.get('/destination', auth, async (req, res) => {
  try {
    if(!req.query.address) {
      return res.status(400).send({
        error: 'You must provide an address.'
      });
    }
    req.user.destination = req.query.address;
    await req.user.save();
    // add request to map api & attractions api here
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
