const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const Filter = require("bad-words");

const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("./utils/users");

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

  // Listen "join" event
  socket.on("join", ({ username, room }, callback) => {
    // Call addUser()
    const { error, user } = addUser({
      id: socket.id,
      username: username,
      room: room,
    });

    if (error) {
      return callback(error);
    }

    // Create Chat Room
    socket.join(user.room);

    // Create new Event, then to listen it we need to recieve it in client side
    socket.emit("message", {
      text: "Welcome!",
      createdAt: new Date().getTime(),
      username: "Admin",
    });

    // Method for displaying "New user joined"
    socket.broadcast.to(user.room).emit("message", {
      text: `${user.username} has joined!`,
      createdAt: new Date().getTime(),
      username: "Admin",
    });

    // Emit new event to track user and display on sidebar
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    callback();
  });

  // listen "sendMessage" event
  socket.on("sendMessage", (msg, callback) => {
    // socket.on("message",msg) [NOTE: here socket targets perticular one connection, while we want changes to be made in all opened connection]

    const filter = new Filter();

    if (filter.isProfane(msg)) {
      return callback("Profane is not allowed!");
    }

    // Get the user
    const user = getUser(socket.id);

    io.to(user.room).emit("message", {
      text: msg,
      createdAt: new Date().getTime(),
      username: user.username,
    });
    callback();
  });

  // listen "sendLocation" event
  socket.on("sendLocation", (locationObj, callback) => {
    // emit new "locationMessage" event to convert it into clickable link in UI

    // Get the user
    const user = getUser(socket.id);

    io.to(user.room).emit("locationMessage", {
      url: `https://google.com/maps?q=${locationObj.lat},${locationObj.log}`,
      createdAt: new Date().getTime(),
      username: user.username,
    });

    callback();
  });

  // Method for displaying "A user has left!"
  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit("message", {
        text: `${user.username} has left!`,
        createdAt: new Date().getTime(),
        username: "Admin",
      });

      // Emit new event to track user and display on sidebar
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

// listen port using server variable created above
server.listen(port, () => {
  console.log(`It is port ${port} runnig...`);
});
