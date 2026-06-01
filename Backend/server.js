import express from "express"
import http from "http"
import cors from "cors"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import mongoose from "mongoose"
import connectDB from "./config/db.js"
import authRoutes from "./routes/auth.js"
import userRoutes from "./routes/user.js"

dotenv.config();
const app=express();
const server=http.createServer(app);

connectDB();

app.use(express.urlencoded({extended:true}))
app.use(express.json())

app.use(cookieParser());

app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true,
    })
);

app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/users",
    userRoutes
);

app.get("/", (req, res) => {
    res.send("API Running...");
});


const PORT =
    process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(
        `Server running on port ${PORT}`
    );
});
