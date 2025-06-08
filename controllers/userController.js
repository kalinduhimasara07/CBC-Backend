import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import axios from "axios";
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
