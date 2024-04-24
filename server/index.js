import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server);

app.get("/", (req, res) => {
	res.send("<h1>Hello world</h1>");
});

io.on("connection", (socket) => {
	console.log("A user connected with id - ", socket.id);
});

server.listen(3000, () => {
	console.log("server running at http://localhost:3000");
});
