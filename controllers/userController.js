import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import axios from "axios";
import nodemailer from "nodemailer";
import OTP from "../models/otp.js";
dotenv.config();

export function createUser(req, res) {
  if (req.body.role == "admin") {
    if (req.user != null) {
      if (req.user.role != "admin") {
        res
          .status(403)
          .json({ error: "you are not authorized to create admin account" });
        return;
      }
    } else {
      res.status(403).json({
        error:
          "you are not authorized to create admin account.Please logging first",
      });
      return;
    }
  }

  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  const user = new User({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: hashedPassword,
    role: req.body.role,
  });
  user
    .save()
    .then(() => {
      res.json({ message: "User saved successfully" });
    })
    .catch((error) => {
      console.error("Error saving user:", error);
      res.status(500).json({ error: "Error saving user" });
    });
}

export function loginUser(req, res) {
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email: email }).then((user) => {
    console.log(user);
    if (!user) {
      res
        .status(404)
        .json({ error: "User not found", message: "User not found" });
    } else {
      const isPasswordValid = bcrypt.compareSync(password, user.password);
      if (isPasswordValid) {
        if (user.isBlocked) {
          return res.status(403).json({
            error: "User is blocked",
            message: "You are blocked. Please contact support.",
          });
        } else {
          const token = jwt.sign(
            {
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              role: user.role,
              img: user.img,
            },
            process.env.JWT_SECRET_KEY
          );
          console.log(token);
          res.json({
            message: "Login successful",
            token: token,
            role: user.role,
          });
        }
      } else {
        res.status(401).json({
          error: "Invalid credentials",
          message: "Invalid credentials",
        });
      }
    }
  });
}

export function isAdmin(req, res) {
  if (req.user == null) {
    return false;
  }
  if (req.user.role != "admin") {
    return false;
  }
  return true;
}

export function getUsers(req, res) {
  if (!isAdmin(req, res)) {
    return res
      .status(403)
      .json({ error: "You are not authorized to view users" });
  }
  User.find({})
    .then((users) => {
      res.json(users);
    })
    .catch((error) => {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Error fetching users" });
    });
}

//block user
export function blockUser(req, res) {
  if (!isAdmin(req, res)) {
    return res
      .status(403)
      .json({ error: "You are not authorized to block users" });
  }
  const email = req.body.email;
  const status = req.body.status;
  User.findOneAndUpdate({ email: email }, { isBlocked: status })
    .then((user) => {
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({ message: "User block status updated successfully", user });
    })
    .catch((error) => {
      console.error("Error blocking user:", error);
      res.status(500).json({ error: "Error blocking user" });
    });
}

export function getuser(req, res) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ error: "Token missing" });
  }

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Invalid token" });
    }

    User.findOne({ email: decoded.email })
      .then((user) => {
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }
        res.json(user);
      })
      .catch((error) => {
        res.status(500).json({ error: "Error fetching user" });
      });
  });
}

export async function googleLogin(req, res) {
  const googleToken = req.body.token;
  try {
    const response = await axios.get(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${googleToken}`,
        },
      }
    );

    const userData = response.data;
    let user = await User.findOne({ email: userData.email });

    if (user) {
      const jwtToken = jwt.sign(
        {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          img: user.img,
        },
        process.env.JWT_SECRET_KEY
      );
      return res.json({
        message: "Login successful",
        token: jwtToken,
        role: user.role,
      });
    } else {
      const hashedPassword = await bcrypt.hash(
        process.env.DEFAULT_PASSWORD,
        10
      );
      user = new User({
        email: userData.email,
        firstName: userData.given_name,
        lastName: userData.family_name,
        img: userData.picture,
        role: "customer",
        password: hashedPassword,
      });
      await user.save();

      const jwtToken = jwt.sign(
        {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          img: user.img,
        },
        process.env.JWT_SECRET_KEY
      );

      return res.status(201).json({
        message: "Account created successfully",
        token: jwtToken,
        role: user.role,
      });
    }
  } catch (error) {
    console.error("Error logging in with Google:", error.message);
    return res.status(500).json({ error: "Google login failed" });
  }
}

export function updateUser(req, res) {
  //check the token
  if (req.user == null) {
    return res
      .status(403)
      .json({ error: "You are not authorized to update users" });
  }
  const userId = req.params.userId;

  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  const updateData = req.body;

  // Optional: Prevent certain fields from being updated (e.g., email, password)
  // delete updateData.email;
  // delete updateData.password;

  User.updateOne({ _id: userId }, { $set: updateData })
    .then((result) => {
      if (result.matchedCount === 0) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({ message: "User updated successfully" });
    })
    .catch((error) => {
      console.error("Error updating user:", error);
      res.status(500).json({ error: "Error updating user" });
    });
}

const transport = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});
export async function sendOTP(req, res) {
  const randomOTP = Math.floor(100000 + Math.random() * 900000);
  const email = req.body.email;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  const user = await User.findOne({ email: email });
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  //delete all existing OTPs for the user
  await OTP.deleteMany({ email: email });

  const otp = new OTP({ email: email, otp: randomOTP });
  await otp.save();

  transport
    .sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "OTP Verification",
      html: `
    <html>
      <head>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap');
        </style>
        <link href="https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap" rel="stylesheet">
      </head>
      <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f9f9f9;">
        <div style="background-color: #e17100; padding: 20px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-family: 'Great Vibes', cursive;">Crystal Beauty Clear</h1>
          <p style="color: #fff; font-size: 18px;">Your trusted cosmetic products destination</p>
        </div>
        <div style="padding: 20px; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #333333;">Hello!</h2>
          <p style="font-size: 16px; color: #333333;">Thank you for choosing Crystal Beauty Clear! We have received a request to verify your identity.</p>
          <p style="font-size: 16px; color: #333333;">Here is your One-Time Password (OTP) for verification:</p>
          <h3 style="font-size: 32px; color: #e17100; font-weight: bold;">${randomOTP}</h3>
          <p style="font-size: 16px; color: #333333;">Please use this OTP to complete your verification process. This OTP will expire in 10 minutes.</p>
          <p style="font-size: 14px; color: #888888; text-align: center; margin-top: 40px;">
            If you did not request this OTP, please ignore this message. If you need assistance, feel free to reach out to us.
          </p>
        </div>
      </body>
    </html>`,
    })
    .then(() => {
      res.json({ message: "OTP sent successfully", otp: randomOTP });
    })
    .catch((error) => {
      console.error("Error sending OTP:", error);
      res.status(500).json({ error: "Error sending OTP" });
    });
}

export async function resetPassword(req, res) {
  const { email, otp, newPassword } = req.body;
  const user = await User.findOne({ email: email });
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  const otpData = await OTP.findOne({ email: email });
  if (!otpData) {
    return res.status(404).json({ error: "OTP not found" });
  }
  if (otpData.otp !== otp) {
    return res.status(400).json({ error: "Invalid OTP" });
  }
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  await user.save();
  res.json({ message: "Password reset successfully" });
}
