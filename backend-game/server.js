const express = require("express");
const { createServer } = require("node:http");
const { join } = require("node:path");
const { Server } = require("socket.io");
const cors = require('cors')

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3000;

app.use(cors())

const io = new Server(server, {
  cors: {
    origin: "http://localhost:8080" // client/frontend
  }
});

io.on("connection", (socket) => {
  console.log("A user has been connected");
  socket.broadcast.emit("Hello from the server");

  socket.on("disconnect", () => {
    console.log("A user has been disconnected");
  });

  // Sending events to the clients
  socket.on("game-state", (data) => {
    io.emit("game-state", data);
  });
});

server.listen(PORT, () => {
  console.log("Backend Game server:", PORT);
});

