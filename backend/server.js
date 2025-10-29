const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const session = require('express-session');

const app = express();
const PORT = 5000;

// Middleware
app.use(bodyParser.json());

// ✅ CORS config to allow frontend at different localhost ports
app.use(cors({
  origin: [
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    "http://127.0.0.1:5501",
    "http://localhost:5501"
  ],
  methods: ["GET", "POST", "OPTIONS"],
  credentials: true
}));

// ✅ Session config
app.use(session({
  secret: 'homephysioSecret123',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,       // must be false for local HTTP
    sameSite: 'lax',     // allows cross-origin cookies locally
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  }
}));

// ✅ Connect MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/homephysio')
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Error:", err));

// ✅ User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String
});
const User = mongoose.model('User', userSchema);

// ✅ Register Route
app.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ msg: "Please fill all fields" });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ msg: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.json({ msg: "Registration successful!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ Login Route
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("🔐 Login attempt:", email);

    if (!email || !password)
      return res.status(400).json({ msg: "Please fill all fields" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    // Save session
    req.session.userId = user._id;
    req.session.userEmail = user.email;

    req.session.save(err => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).json({ msg: "Session error" });
      }
      console.log("✅ Session saved:", req.session.id);
      res.json({
        msg: "Login successful!",
        user: { name: user.name, email: user.email }
      });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ Profile Route (protected)
app.get('/profile', async (req, res) => {
  console.log("🧠 Checking session:", req.session);
  if (!req.session.userId) {
    return res.status(401).json({ msg: "Not logged in" });
  }

  try {
    const user = await User.findById(req.session.userId);
    if (!user) return res.status(404).json({ msg: "User not found" });

    res.json({ name: user.name, email: user.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ✅ Logout Route
app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ msg: "Logout failed" });
    res.clearCookie('connect.sid');
    res.json({ msg: "Logged out successfully" });
  });
});

// Start server
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
