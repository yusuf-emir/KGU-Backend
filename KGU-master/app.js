const express = require("express");
const dotenv = require("dotenv").config();
require("./src/config/database");
const HttpError = require("./src/error/HttpError");
const authUserRouter = require("./src/router/auth_user_router");
const authMentorRouter = require("./src/router/auth_mentor_router");
const path = require("path");
const http = require("http");

const app = express();

const server = http.createServer(app);

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    method: ["GET", "POST", "PATCH", "DELETE"],
  },
});

const port = process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "src/uploads")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  next();
});

app.use("/api/users", authUserRouter);
app.use("/api/mentors", authMentorRouter);

app.use("/join", (req, res, next) => {
  res.send({ link: v4() });
});

app.use((req, res, next) => {
  const error = new HttpError("Could not be found this route", 404);
  next(error);
});

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error);
  }
  res
    .status(error.code || 500)
    .json({ message: error.message || "An unknown error occured." });
});

io.on("connection", (socket) => {
  socket.emit("me", socket.id);

  socket.on("disconnect", () => {
    socket.broadcast.emit("callEnded");
  });

  socket.on("callUser", (data) => {
    io.to(data.userToCall).emit("callUser", {
      signal: data.signalData,
      from: data.from,
      name: data.name,
    });
  });

  socket.on("answerCall", (data) => {
    io.to(data.to).emit("callAccepted", data.signal);
  });
});

server.listen(port, () => {
  console.log("PORT " + port + " is listening");
});
