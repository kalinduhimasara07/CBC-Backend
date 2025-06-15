import express from "express";
import {
  blockUser,
  createUser,
  getuser,
  getUsers,
  googleLogin,
  loginUser,
  resetPassword,
  sendOTP,
  updateUser,
} from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/", createUser);
userRouter.post("/login", loginUser);
userRouter.get("/", getUsers);
userRouter.put("/", blockUser);
userRouter.get("/user", getuser);
userRouter.post("/google", googleLogin);
userRouter.put("/:userId", updateUser);
userRouter.post("/send-otp", sendOTP);
userRouter.post("/reset-password", resetPassword);

export default userRouter;
