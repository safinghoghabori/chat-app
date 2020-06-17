/*
  ============THIS IS FOR UNDERSTAING bcuz we are adding more code in this file=============
*/

const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const Filter = require("bad-words");

const app = express();

// Create new server[NOTE: express creates this behind the scene, nonethless we create it here bcuz we need to pass it as a parameter inside the socketio() function as below]
const server = http.createServer(app);

// Create instance of socket.io to supprt it
const io = socketio(server);

const port = process.env.PORT || 3000;

const publicDirectoryPath = path.join(__dirname, "../public");
app.use(express.static(publicDirectoryPath));

// Create Event, and will execute automatically when event occurs
io.on("connection", (socket) => {
  console.log("New WebSocket Connection");

  // Create new Event, then to listen it we need to recieve it in client side
  socket.emit("message", "Welcome!");

  // Method for displaying "New user joined"
  socket.broadcast.emit("message", "A new user has joined!");

  // listen "sendMessage" event
  socket.on("sendMessage", (msg, callback) => {
    // socket.on("message",msg) [NOTE: here socket targets perticular one connection, while we want changes to be made in all opened connection]

    const filter = new Filter();

    if (filter.isProfane(msg)) {
      return callback("Profane is not allowed!");
    }

    io.emit("message", msg);
    callback();
  });

  // listen "sendLocation" event
  socket.on("sendLocation", (locationObj, callback) => {
    io.emit(
      "message",
      `https://google.com/maps?q=${locationObj.lat},${locationObj.log}`
    );
    callback();
  });

  // Method for displaying "A user has left!"
  socket.on("disconnect", () => {
    io.emit("message", "A user has left!");
  });
});

// listen port using server variable created above
server.listen(port, () => {
  console.log(`It is port ${port} runnig...`);
});
