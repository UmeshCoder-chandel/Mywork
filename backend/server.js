import express from "express"
import mongoose from "mongoose"
import dotenv from "dotenv"
import cors from "cors"
import cookieParser from "cookie-parser"
import path from "path"
import { fileURLToPath } from "url"
import http from "http"
import { Server } from "socket.io"
import fs from "fs"
import helmet from "helmet"
import rateLimit from "express-rate-limit"
import Conversation from "./models/Conversation.js"
import postRouter from "./router/postRouter.js"
import socialUserRouter from "./router/socialUserRouter.js"
import storyRouter from "./router/storyRouter.js"
import notificationRouter from "./router/notificationRouter.js"
import chatRouter from "./router/chatRouter.js"
import socialAuthRouter from "./router/socialAuthRouter.js"
dotenv.config();
const app =express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log("📁 Created uploads directory");
}

// CORS configuration - allow multiple origins
const allowedOrigins = process.env.CLIENT_URL 
    ? process.env.CLIENT_URL.split(',').map(url => url.trim())
    : ["http://localhost:5173"];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
            callback(null, true);
        } else {
            console.warn('CORS blocked origin:', origin);
            callback(null, true); // Allow all origins in development, restrict in production
        }
    },
    credentials: true
}))
app.use(helmet())

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
})
app.use(limiter)

app.use(cookieParser());
app.use(express.json())
app.use("/uploads", express.static(uploadsDir))

mongoose.connect(process.env.MONGO_URL || "mongodb://127.0.0.1:27017/worksocial").then(()=>{
    console.log("✅ MongoDB connected successfully");
}).catch((err)=>{
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
})

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        credentials: true
    }
});

io.on("connection", (socket) => {
    console.log("Socket connected", socket.id);
    socket.on("auth", (userId) => {
        socket.join(String(userId));
        socket.data.userId = String(userId);
    })
    socket.on("join", ({ userId }) => {
        socket.join(String(userId));
        socket.data.userId = String(userId);
    })
    socket.on("typing", async ({ conversationId, typing }) => {
        try {
            const conv = await Conversation.findById(conversationId);
            if (!conv) return;
            const other = conv.participants.find((p) => String(p) !== String(socket.data.userId));
            if (other) {
                io.to(String(other)).emit("typing", { conversationId, userId: socket.data.userId, typing });
            }
        } catch {}
    })
    socket.on("disconnect", () => {
        console.log("Socket disconnected", socket.id);
    })
})

app.use((req,res,next)=>{
    req.io = io;
    next();
})


app.use("/api/social/auth", socialAuthRouter)
app.use("/api/social/users", socialUserRouter)
app.use("/api/social/posts", postRouter)
app.use("/api/social/stories", storyRouter)
app.use("/api/social/notifications", notificationRouter)
app.use("/api/social/chat", chatRouter)

const PORT = process.env.PORT || 3000;
server.listen(PORT,()=>{
    console.log("server started on port", PORT);  
})
