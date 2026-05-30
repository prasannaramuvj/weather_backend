const express = require("express");
const cors = require("cors");
const axios = require("axios");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const User = require("./user");

require("dotenv").config();

console.log(process.env.API_KEY);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    console.error("Make sure your MongoDB Atlas IP is whitelisted");
  });

//-------------------------------------------------------------------------------------//

app.post("/api/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    // const existsuser = users.find((usernames)=>usernames.username == username)
    const existsuser = await User.findOne({ username });

    if (existsuser) {
      return res.status(400).json({ msg: "already username exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // const newuser = {
    //   username,
    //   password:hashedPassword
    // }

    // users.push(newuser)
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    return res.status(201).json({ msg: "created successfully" });
  } catch (err) {
    return res.status(500).json({ msg: "errro ocuured", err: err.message });
  }
});

//------------------------------------------------------------------------------------------------------//
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // find user
    // const existsuser = users.find(
    //   (usernames) => usernames.username == username
    // )
    const existsuser = await User.findOne({ username });
    // username check
    if (!existsuser) {
      return res.status(400).json({
        msg: "username not found",
      });
    }

    // compare password
    const isMatch = await bcrypt.compare(password, existsuser.password);

    if (!isMatch) {
      return res.status(400).json({
        error: "Invalid password!",
      });
    }

    // success login
    res.status(200).json({
      message: "Login successful!",
      user: {
        username: existsuser.username,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: "Server error during login.",
    });
  }
});

// --------------------------------------------------------------------------------------------//
app.get("/api/weather", async (req, res) => {
  const cityname = req.query.city;

  if (!cityname) {
    return res.status(400).json({ msg: "enter the city name" });
  }
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityname}&appid=${process.env.API_KEY}&units=metric`;
    console.log(url);
    const response = await axios.get(url);
    return res.json(response.data);
  } catch (err) {
    console.error(
      "Weather API error:",
      err.response?.status,
      err.response?.data || err.message,
    );
    const statusCode = err.response?.status || 500;
    const message =
      err.response?.data?.message ||
      err.response?.data?.cod ||
      err.message ||
      "Failed to fetch weather";
    res.status(statusCode).json({ msg: message });
  }
});

app.get("/api/forecast", async (req, res) => {
  const city = req.query.city;

  const response = await axios.get(
    `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${process.env.API_KEY}`
  );

  res.json(response.data);
});

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
