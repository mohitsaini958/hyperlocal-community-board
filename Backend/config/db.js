import mongoose from "mongoose";

mongoose
.connect(process.env.MONGO_URL)
.then(()=>console.log("mongo is connected"))
.catch(err=>console.log(err));

