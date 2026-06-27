import dotenv from "dotenv"
dotenv.config();
import express from "express"
import http from "http"
import cors from "cors"
import cookieParser from "cookie-parser"
import mongoose from "mongoose"
import connectDB from "./config/db.js"
import authRoutes from "./routes/auth.js"
import userRoutes from "./routes/user.js"
import { Server } from "socket.io";
import postRoutes from "./routes/posts.js"
import uploadRoutes from "./routes/upload.js"
import commentRoutes from "./routes/comments.js"
import reportRoutes from "./routes/report.js"
import notificationRoutes from "./routes/notifications.js"
import setupGeoSocket from "./sockets/geoSockets.js";

const app=express();
const server=http.createServer(app);

connectDB();

app.use(express.urlencoded({extended:true}))
app.use(express.json())

app.use(cookieParser());

const io=new Server(
    server,
    {
        cors:{
            origin:process.env.CLIENT_URL,
            credentials:true,
        },
    }
);

io.on(
    "connection",
    (socket) => {

        console.log(
            "User Connected"
        );

        setupGeoSocket(
            io,
            socket
        );
    }
);

app.set("io",io);

app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
    })
);

app.use(
    "/api/auth",
    authRoutes
);

app.use("/api/comments",commentRoutes);

app.use(
    "/api/users",
    userRoutes
);

app.use(
    "/api/posts",
    postRoutes
);

app.use("/api",reportRoutes);

app.use("/api/upload",uploadRoutes);

app.use("/api/notifications",notificationRoutes);

app.get("/", (req, res) => {
    res.send("API Running...");
});


const PORT =
    process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(
        `Server running on port ${PORT}`
    );
});