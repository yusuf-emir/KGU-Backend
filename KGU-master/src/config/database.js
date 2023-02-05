const mongoose = require("mongoose");
const dotenv = require("dotenv");

mongoose
  .connect(process.env.MONGODB_CONNECTION_STRING, {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((_) => {
    console.log("Connected to database");
  })
  .catch((error) => {
    console.log(error);
  });
