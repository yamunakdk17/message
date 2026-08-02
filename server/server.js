import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRouters.js";
import { Server} from "socket.io";
import dns from "dns";

dns.setServers(["8.8.8.8"]);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientBuildPath = path.join(__dirname, "../client/dist");

// create express app and HTTP server
const app = express();
const server = http.createServer(app);


// Initialize socket.io server
export const io = new Server(server, {
    cors: {
        origin: [
            "http://localhost:5173",
            // "https://chat-app-eight-tau-61.vercel.app",
            // "https://chat-app-rho-bice.vercel.app",
           " https://messagee-omega.vercel.app",        ],
        credentials: true,
    },
});

// Store online users
export const userSocketMap = {}; // { userId: socketId }

// Socket.io connection handler
io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    console.log("User Connected", userId);

    if (userId) userSocketMap[userId] = socket.id;

    // Emit online users to all connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
        console.log("User Disconnected", userId);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});




// Middleware setup
app.use(express.json({ limit: "4mb" }));
app.use((req, res, next) => {
    res.setHeader(
        "Content-Security-Policy",
        "default-src 'self'; img-src 'self' data:; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self' http://localhost:5173 https://chat-app-eight-tau-61.vercel.app"
    );
    next();
}); app.use(
    cors({
        origin: [
            "http://localhost:5173",
            // "https://chat-app-eight-tau-61.vercel.app",
            // "https://chat-app-rho-bice.vercel.app",
            "https://messagee-omega.vercel.app",
        ],
        credentials: true,
    })
);
// Test route
app.use("/api/status", (req, res) => {
    res.send("Server is live");
});
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter)



//Connect to MongoDB
await connectDB();

// Start server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log("Server is running on PORT: " + PORT);
});