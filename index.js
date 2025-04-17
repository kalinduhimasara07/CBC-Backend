import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import productRouter from "./routes/productRouter.js";
import userRouter from "./routes/userRouter.js";
import Jwt from "jsonwebtoken";
import orderRouter from "./routes/orderRouter.js";

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
  const tokenString = req.header("Authorization");
  if (tokenString != null) {
    const token = tokenString.replace("Bearer ", "");
    Jwt.verify(token, "secretKey", (err, decoded) => {
      if (decoded != null) {
        //console.log(decoded);
        req.user = decoded; //attach the user object to the request
        next();
      } else {
        console.log("invalid token");
        res.status(403).json({ error: "Invalid token" });
      }
    });
    //console.log(token);
  } else {
    next();
  }
});

mongoose
  .connect(
    "mongodb+srv://admin:123@cluster0.n07ll.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

app.use("/product", productRouter);
app.use("/users", userRouter);
app.use("/orders", orderRouter);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

//mongodb+srv://admin:123@cluster0.n07ll.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImthbGluZHVAZ21haWwuY29tIiwiZmlyc3ROYW1lIjoia2FsaW5kdSIsImxhc3ROYW1lIjoiSGltYXNhcmEiLCJyb2xlIjoiYWRtaW4iLCJpbWciOiJodHRwczovL2F2YXRhci5pcmFuLmxpYXJhLnJ1bi9wdWJsaWMvYm95P3VzZXJuYW1lPUFzaCIsImlhdCI6MTc0MzM0NjczMn0.FGV_c-EuMPUUE7FAXxw_TTCFp3UsZEICRbCepLYXir0
//email = kalindu@gmail.com
//password = 123abcd
