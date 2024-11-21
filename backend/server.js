const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(cors()); 

mongoose
  .connect("mongodb://127.0.0.1:27017/quizApp")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));


const User = mongoose.model("User", new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
}));

app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: "User registered successfully!" });
  } catch (err) {
    res.status(400).json({ error: "User already exists or invalid data." });
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: "Invalid username or password." });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(400).json({ error: "Invalid username or password." });

    const token = jwt.sign({ id: user._id }, "your_secret_key");
    res.status(200).json({ message: "Login successful!", token });
  } catch (err) {
    res.status(500).json({ error: "Something went wrong." });
  }
});

app.get("/quiz", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(403).json({ error: "Access denied. Token missing." });

  jwt.verify(token, "your_secret_key", (err) => {
    if (err) return res.status(403).json({ error: "Invalid token." });
    res.status(200).json({ message: "Welcome to the quiz page!" });
  });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
