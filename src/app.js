require('dotenv').config({path: './.env'});
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const userRouter = require('./routers/user');
const weatherRouter = require('./routers/weather');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use(userRouter);
app.use(weatherRouter);

mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

app.listen(process.env.PORT, () => {
  console.log('Server started on port ' + process.env.PORT);
});
