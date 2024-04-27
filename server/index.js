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

/**
 * Algorithm would be as follows:
 * 1. When a new client joins we broadcast an event to all connected clients,
 *    stating the id, numberOfClientsConnected and socketId of that client.
 * 2. We create a relay, such that it by passes the message to all the clients except for itself.
 *
 */
io.on("connection", (socket) => {
	const clientCount = io.engine.clientsCount;
	const clientIds = Array.from(io.sockets.sockets, (value) => value[0]);
	console.log("A user connected with id - ", socket.id, clientIds);

	io.emit("new-user", socket.id, clientCount, clientIds);

	socket.on("init", (toId, msg) => {
		console.log({ toId, socketId: socket.id, msg: Object.keys(msg) });
		socket.broadcast.emit("init", toId, msg);
		// io.to(toId).emit("init", socket.id, msg);
	});
});

server.listen(3000, () => {
	console.log("server running at http://localhost:3000");
});
