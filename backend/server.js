const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const session = require('express-session');

const app = express();
const PORT = 5000;
const path = require('path');

// -------------------- MIDDLEWARE --------------------
app.use(bodyParser.json());

// Allow local dev from both localhost and 127.0.0.1 on any port
const allowedOrigins = [
    /^https?:\/\/127\.0\.0\.1:\d+$/,
    /^https?:\/\/localhost:\d+$/
];

app.use(cors({
    origin: function(origin, callback) {
        // allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        if (allowedOrigins.some(re => re.test(origin))) return callback(null, true);
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));

// Configure session cookie options depending on environment
const isProd = process.env.NODE_ENV === 'production';

if (isProd) {
    // if running behind a proxy (Heroku, nginx), trust the first proxy
    app.set('trust proxy', 1);
}

// Choose SameSite and Secure appropriately:
// - In production we use SameSite='none' and secure=true (requires HTTPS).
// - In development use SameSite='lax' and secure=false so browsers accept the cookie.
const cookieOptions = {
    httpOnly: true,
    secure: isProd, // secure cookies require HTTPS in production
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000
};

app.use(session({
    name: 'homephysio.sid',
    secret: process.env.SESSION_SECRET || 'homephysioSecret123',
    resave: false,
    saveUninitialized: false,
    cookie: cookieOptions
}));

// Log cookie options at startup to help debug cookie issues
console.log('Session cookie options:', cookieOptions);

// -------------------- DATABASE CONNECT --------------------
mongoose.connect('mongodb://127.0.0.1:27017/homephysio')
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.error("❌ MongoDB Error:", err));

// -------------------- SERVE FRONTEND (same origin) --------------------
// Serve the project root so files like login.html and profile.html are
// available at http://localhost:5000/login.html etc. This avoids cross-origin
// cookie issues during development.
const publicDir = path.join(__dirname, '..');
app.use(express.static(publicDir));
console.log('Serving frontend from', publicDir);

// -------------------- SCHEMAS & MODELS --------------------
const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String
});
const User = mongoose.model('User', userSchema);

const adminSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String
});
const Admin = mongoose.model('Admin', adminSchema);

const exerciseSchema = new mongoose.Schema({
    name: String,
    description: String,
    difficulty: String,
    category: String,
    reps: String,
    sets: String,
    image: String
});
const Exercise = mongoose.model('Exercise', exerciseSchema);

const routineSchema = new mongoose.Schema({
    name: { type: String, required: true },
    exercises: [{
        name: String,
        image: String,
        description: String,
        sets: String,
        reps: String,
        difficulty: String,
        category: String
    }],
    userEmail: { type: String, required: true }
});
const Routine = mongoose.model('Routine', routineSchema);

// -------------------- USER ROUTES --------------------
app.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password)
            return res.status(400).json({ msg: "Please fill all fields" });

        const existingUser = await User.findOne({ email });
        if (existingUser)
            return res.status(400).json({ msg: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword });

        await newUser.save();
        res.json({ msg: "Registration successful!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password)
            return res.status(400).json({ msg: "Please fill all fields" });

        const user = await User.findOne({ email });
        if (!user)
            return res.status(400).json({ msg: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res.status(400).json({ msg: "Invalid credentials" });

        // Save session
        req.session.userId = user._id;

        req.session.save(err => {
            if (err) return res.status(500).json({ msg: "Session error" });
            res.json({
                msg: "Login successful!",
                user: { name: user.name, email: user.email }
            });
            // Log the Set-Cookie header sent in this response (if any)
            try { console.log('Login response Set-Cookie:', res.getHeader('Set-Cookie')); } catch (e) { }
        });

        // Log session id for debugging
        console.log('User logged in, sessionID:', req.sessionID, 'user:', email);

    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

// -------------------- PROFILE (PROTECTED) --------------------
app.get('/profile', async (req, res) => {
    if (!req.session.userId)
        return res.status(401).json({ msg: "Not logged in" });

    try {
        const user = await User.findById(req.session.userId);
        if (!user) return res.status(404).json({ msg: "User not found" });

        res.json({ name: user.name, email: user.email });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
    }
});

// -------------------- LOGOUT --------------------
app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).json({ msg: "Logout failed" });
        res.clearCookie('homephysio.sid');
        res.json({ msg: "Logged out successfully" });
    });
});

// -------------------- ADMIN LOGIN --------------------
app.post('/admin/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const admin = await Admin.findOne({ email });

        if (!admin)
            return res.status(400).json({ msg: "Invalid credentials" });

        if (admin.password !== password)
            return res.status(400).json({ msg: "Invalid credentials" });

        req.session.adminId = admin._id;
        req.session.adminEmail = admin.email;

        req.session.save(err => {
            if (err) return res.status(500).json({ msg: "Session error" });

            res.json({
                msg: "Admin login successful!",
                admin: { name: admin.name, email: admin.email }
            });
            try { console.log('Admin login response Set-Cookie:', res.getHeader('Set-Cookie')); } catch (e) { }
        });

    } catch (err) {
        res.status(500).json({ msg: "Server error" });
    }
});

// -------------------- ROUTINES --------------------
app.post('/routines', async (req, res) => {
    try {
        const { name, userEmail } = req.body;

        if (!name || !userEmail)
            return res.status(400).json({ msg: "Missing fields" });

        const newRoutine = new Routine({ name, exercises: [], userEmail });
        await newRoutine.save();

        res.json({ msg: "Routine created", routine: newRoutine });
    } catch (err) {
        res.status(500).json({ msg: "Server error" });
    }
});

app.get('/routines/:email', async (req, res) => {
    try {
        const routines = await Routine.find({ userEmail: req.params.email });
        res.json(routines);
    } catch (err) {
        res.status(500).json({ msg: "Server error" });
    }
});

app.post('/routines/:id/addExercise', async (req, res) => {
    try {
        const { exercise } = req.body;

        if (!exercise)
            return res.status(400).json({ msg: "No exercise provided" });

        const routine = await Routine.findById(req.params.id);
        if (!routine)
            return res.status(404).json({ msg: "Routine not found" });

        routine.exercises.push(exercise);
        await routine.save();

        res.json({ msg: "Exercise added", routine });
    } catch (err) {
        res.status(500).json({ msg: "Server error" });
    }
});

// -------------------- EXERCISES CRUD --------------------
app.post('/api/exercises', async (req, res) => {
    try {
        const newExercise = new Exercise(req.body);
        await newExercise.save();
        res.json(newExercise);
    } catch (err) {
        res.status(500).json({ msg: "Failed to add exercise" });
    }
});

app.get('/api/exercises', async (req, res) => {
    try {
        const exercises = await Exercise.find();
        res.json(exercises);
    } catch (err) {
        res.status(500).json({ msg: "Failed to fetch exercises" });
    }
});

app.put('/api/exercises/:id', async (req, res) => {
    try {
        const updated = await Exercise.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(404).json({ msg: "Exercise not found" });

        res.json(updated);
    } catch (err) {
        res.status(500).json({ msg: "Failed to update exercise" });
    }
});

app.delete('/api/exercises/:id', async (req, res) => {
    try {
        const deleted = await Exercise.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ msg: "Exercise not found" });

        res.json({ msg: "Exercise deleted" });
    } catch (err) {
        res.status(500).json({ msg: "Failed to delete exercise" });
    }
});

// -------------------- START SERVER --------------------
app.listen(PORT, () =>
    console.log(`🚀 Server running at http://localhost:${PORT}`)
);

// -------------------- DEBUG ROUTES --------------------
// Useful for checking whether the browser sends the cookie and what the
// server sees in the session during debugging.
app.get('/debug/session', (req, res) => {
    res.json({
        sessionID: req.sessionID || null,
        session: req.session || null,
        cookieHeader: req.headers.cookie || null
    });
});

// Update Admin Profile
app.put('/admin/update/:id', async (req, res) => {
    try {
        const { name, email, password, pic } = req.body; // include pic if you store image as base64
        const adminId = req.params.id;

        const updatedAdmin = await Admin.findByIdAndUpdate(
            adminId,
            { name, email, password, pic }, // update fields
            { new: true, runValidators: true }
        );

        if (!updatedAdmin) return res.status(404).json({ msg: "Admin not found" });

        // Update session email if changed
        if (req.session.adminId === adminId) {
            req.session.adminEmail = updatedAdmin.email;
        }

        res.json({ msg: "Admin profile updated!", admin: updatedAdmin });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Error updating admin profile" });
    }
});

