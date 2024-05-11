import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server, {
	cors: {
		origin: "*",
	},
});

io.on("connection", (socket) => {
	/**
	 * Algo for setting polite and impolite
	 * - The new user will be impolite.
	 * - Rest of the clients will be impolite
	 */

	socket.broadcast.emit("user-joined", true, socket.id);
	io.to(socket.id).emit("user-joined", false, socket.id);

	socket.on("signal", async (socketId, data) => {
		socket.broadcast.emit("signal", socketId, data);
	});
});

server.listen(3000, () => {
	console.log("server running at http://localhost:3000");
});
