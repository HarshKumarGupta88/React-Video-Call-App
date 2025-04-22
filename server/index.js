import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-room", (roomId) => {
    console.log("Joining room:", roomId);
    socket.join(roomId);

    // Notify other users in the room
    socket.to(roomId).emit("user-joined", socket.id);

    // Also send existing users in the room to the new user
    const usersInRoom = [
      ...(io.sockets.adapter.rooms.get(roomId) || []),
    ].filter((id) => id !== socket.id);
    socket.emit("all-users", usersInRoom);
  });

  socket.on("offer", ({ target, sdp }) => {
    socket.to(target).emit("offer", {
      sdp,
      caller: socket.id,
    });
  });

  socket.on("answer", ({ target, sdp }) => {
    socket.to(target).emit("answer", {
      sdp,
      responder: socket.id,
    });
  });

  socket.on("ice-candidate", ({ target, candidate }) => {
    socket.to(target).emit("ice-candidate", {
      candidate,
      from: socket.id,
    });
  });

  socket.on("media-toggled", (data) => {
    socket.to(data.room).emit("media-toggled", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    io.emit("user-left", socket.id);
  });
});

server.listen(5000, () => {
  console.log("🚀 Signaling server running at http://localhost:5000");
});