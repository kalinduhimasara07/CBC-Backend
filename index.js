import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import productRouter from "./routes/productRouter.js";
import userRouter from "./routes/userRouter.js";
import Jwt from "jsonwebtoken";
import orderRouter from "./routes/orderRouter.js";
import reviewRouter from "./routes/reviewRouter.js";
import cors from "cors";
import dotenv from "dotenv";
import siteReviewRouter from "./routes/siteReviewRouter.js";
dotenv.config();

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use((req, res, next) => {
  const tokenString = req.header("Authorization");
  if (tokenString != null) {
    const token = tokenString.replace("Bearer ", "");
    Jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
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
  .connect(process.env.MONGODB_URl)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

// Routes
app.get("/", (req, res) => {
  res.send("🚀 API is live on Azure");
});

app.use("/api/product", productRouter);
app.use("/api/users", userRouter);
app.use("/api/orders", orderRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/siteReviews", siteReviewRouter);

// ✅ Azure-compatible dynamic port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

//email = kalindu@gmail.com
//password = 123abcd
