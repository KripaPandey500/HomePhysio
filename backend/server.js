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

// --- update Admin schema to include pic and desc and timestamps ---
const adminSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    pic: { type: String, default: '' },
    desc: { type: String, default: '' }
}, { timestamps: true });
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

// -------------------- ADMIN PROFILE (GET CURRENT) --------------------
app.get('/admin/profile', async (req, res) => {
    try {
        if (!req.session.adminId) return res.status(401).json({ msg: 'Not logged in as admin' });

        const admin = await Admin.findById(req.session.adminId).lean();
        if (!admin) return res.status(404).json({ msg: 'Admin not found' });

        // don't send password
        delete admin.password;
        res.json(admin);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
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

// ADMIN LOGIN
app.post('/admin/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('[ADMIN LOGIN] Attempt for email:', email);
        if (!email || !password) return res.status(400).json({ msg: "Please fill all fields" });

        const admin = await Admin.findOne({ email });
        if (!admin) {
            console.log('[ADMIN LOGIN] No admin found for email:', email);
            return res.status(400).json({ msg: "Invalid credentials" });
        }
        console.log('[ADMIN LOGIN] Admin found:', { _id: admin._id, name: admin.name, email: admin.email });

        // If admin.password looks like a bcrypt hash (starts with $2), use bcrypt.compare.
        let isMatch = false;
        const hasHash = admin.password && admin.password.startsWith('$2');
        console.log('[ADMIN LOGIN] Stored password hasHash:', hasHash);

        if (hasHash) {
            isMatch = await bcrypt.compare(password, admin.password);
            console.log('[ADMIN LOGIN] bcrypt.compare result:', isMatch);
        } else {
            // legacy/plain password (not recommended). Compare directly,
            // but at login success we will re-hash the password to update DB.
            isMatch = (admin.password === password);
            console.log('[ADMIN LOGIN] Plaintext compare result:', isMatch);

            if (isMatch) {
                // re-hash and save to make stored password secure
                const hashed = await bcrypt.hash(password, 10);
                admin.password = hashed;
                await admin.save();
                console.log('[ADMIN LOGIN] Password re-hashed and saved');
            }
        }

        if (!isMatch) {
            console.log('[ADMIN LOGIN] Credentials do not match!');
            return res.status(400).json({ msg: "Invalid credentials" });
        }

        req.session.adminId = admin._id;
        req.session.adminEmail = admin.email;

        console.log('[ADMIN LOGIN] Session set: adminId=', req.session.adminId, 'sessionID=', req.sessionID);

        req.session.save(err => {
            if (err) {
                console.log('[ADMIN LOGIN] Session save error:', err);
                return res.status(500).json({ msg: "Session error" });
            }
            console.log('[ADMIN LOGIN] Session saved successfully');
            res.json({
                msg: "Admin login successful!",
                admin: { name: admin.name, email: admin.email }
            });
            try { console.log('[ADMIN LOGIN] Set-Cookie:', res.getHeader('Set-Cookie')); } catch (e) { }
        });

    } catch (err) {
        console.error('[ADMIN LOGIN] Error:', err);
        res.status(500).json({ msg: "Server error" });
    }
});

// Update Admin Profile
app.put('/admin/update/:id', async (req, res) => {
    try {
        const adminId = req.params.id;
        const { name, email, password, pic, desc } = req.body;
        console.log('Admin update request for id:', adminId, 'body:', req.body, 'session.adminId:', req.session && req.session.adminId);

        // Build update object only with provided fields
        const update = {};
        if (name !== undefined) update.name = name;
        if (email !== undefined) update.email = email;
        if (pic !== undefined) update.pic = pic;
        if (desc !== undefined) update.desc = desc;

        if (password) {
            // if password provided, hash it before saving
            update.password = await bcrypt.hash(password, 10);
        }

        const updatedAdmin = await Admin.findByIdAndUpdate(
            adminId,
            update,
            { new: true, runValidators: true, context: 'query' }
        ).lean();

        if (!updatedAdmin) return res.status(404).json({ msg: "Admin not found" });

        // Update session email if the logged-in admin updated their own email
        if (req.session && String(req.session.adminId) === String(adminId)) {
            req.session.adminEmail = updatedAdmin.email;
            req.session.save(() => {}); // best-effort save
        }

        // remove sensitive fields before returning
        if (updatedAdmin.password) delete updatedAdmin.password;
        res.json({ msg: "Admin profile updated!", admin: updatedAdmin });
    } catch (err) {
        console.error(err);
        // If duplicate key on email -> return helpful message
        if (err.code === 11000 && err.keyPattern && err.keyPattern.email) {
            return res.status(400).json({ msg: "Email already in use" });
        }
        // return specific mongoose validation errors if present
        if (err.errors) {
            const messages = Object.values(err.errors).map(e => e.message).join('; ');
            return res.status(400).json({ msg: messages });
        }
        res.status(500).json({ msg: "Error updating admin profile" });
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

// -------------------- START SERVER --------------------
app.listen(PORT, () =>
    console.log(`🚀 Server running at http://localhost:${PORT}`)
);

