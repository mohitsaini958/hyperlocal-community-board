import express from "express"
import http from "http"
import cors from "cors"
import dotenv from "dotenv"

dotenv.config();
const app=express();
const server=http.createServer(app);

app.use(cors());
app.use(express.urlencoded({extended:true}))
app.use(express.json())

app.get("/",(req,res)=>{
    res.json({message:"server is running"});
})

app.use((err,req,res,next)=>{
    console.error(err);
    res.status(500).json({
        message:"Internal Server Error",
    })
})

app.listen(5000,()=>{
    console.log("server is listening to ports 5000");
})

