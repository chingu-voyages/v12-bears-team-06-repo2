require('dotenv').config({path: './.env'});
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const userRouter = require('./routers/user');
const destinationRouter = require('./routers/destination');
const todosRouter = require("./routers/todos");


const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

app.use(userRouter);
app.use(destinationRouter);
app.use("/todolist", todosRouter);

mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
}).catch(error => console.log('Could not make a connection to the database'));

app.listen(process.env.PORT, () => {
  console.log('Server started on port ' + process.env.PORT);
});
