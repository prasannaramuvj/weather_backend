const express = require("express");
const cors = require("cors");
const axios = require("axios");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const User = require("./user");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB Atlas");
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err.message);
  });

mongoose.connection.on("connected", () => {
  console.log("📦 MongoDB Connected");
});

mongoose.connection.on("error", (err) => {
  console.log("MongoDB Error:", err);
});


// ===================================================
// REGISTER API
// ===================================================

app.post("/api/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        msg: "Username and Password are required",
      });
    }

    const existingUser = await User.findOne({
      username,
    });

    if (existingUser) {
      return res.status(400).json({
        msg: "Username already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({
      msg: "User registered successfully",
    });
  } catch (err) {
    res.status(500).json({
      msg: "Server Error",
      error: err.message,
    });
  }
});


// ===================================================
// LOGIN API
// ===================================================

app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        msg: "Username and Password are required",
      });
    }

    const existingUser = await User.findOne({
      username,
    });

    if (!existingUser) {
      return res.status(400).json({
        msg: "Username not found",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!isMatch) {
      return res.status(400).json({
        msg: "Invalid password",
      });
    }

    res.status(200).json({
      msg: "Login Successful",
      user: {
        username: existingUser.username,
      },
    });
  } catch (err) {
    res.status(500).json({
      msg: "Server Error",
    });
  }
});


// ===================================================
// CURRENT WEATHER API
// ===================================================

app.get("/api/weather", async (req, res) => {
  try {
    const city = req.query.city;

    if (!city) {
      return res.status(400).json({
        msg: "Enter city name",
      });
    }

    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.API_KEY}&units=metric`
    );

    res.json(response.data);
  } catch (err) {
    console.error(
      "Weather Error:",
      err.response?.data || err.message
    );

    res.status(err.response?.status || 500).json({
      msg:
        err.response?.data?.message ||
        "Failed to fetch weather",
    });
  }
});


// ===================================================
// 5 DAY FORECAST API
// ===================================================

app.get("/api/forecast", async (req, res) => {
  try {
    const city = req.query.city;

    if (!city) {
      return res.status(400).json({
        msg: "Enter city name",
      });
    }

    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${process.env.API_KEY}&units=metric`
    );

    res.json(response.data);
  } catch (err) {
    console.error(
      "Forecast Error:",
      err.response?.data || err.message
    );

    res.status(err.response?.status || 500).json({
      msg:
        err.response?.data?.message ||
        "Failed to fetch forecast",
    });
  }
});


// ===================================================
// TEST ROUTE
// ===================================================

app.get("/", (req, res) => {
  res.send("Weather Backend Running 🚀");
});


// ===================================================
// SERVER START
// ===================================================

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});