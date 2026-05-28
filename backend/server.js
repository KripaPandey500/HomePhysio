const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = 5000;

// -------------------- MIDDLEWARE --------------------
// Use express built-in JSON parser (Express 5 compatible)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = [
    /^https?:\/\/127\.0\.0\.1:\d+$/,
    /^https?:\/\/localhost:\d+$/
];

app.use(cors({
    origin: function(origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.some(re => re.test(origin))) return callback(null, true);
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));

const isProd = process.env.NODE_ENV === 'production';
if (isProd) app.set('trust proxy', 1);

const cookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000
};

app.use(session({
    name: 'hp.sid',
    secret: process.env.SESSION_SECRET || 'homephysioSecret123',
    resave: true,
    saveUninitialized: false,
    cookie: cookieOptions
}));

// -------------------- DATABASE --------------------
mongoose.connect('mongodb://127.0.0.1:27017/homephysio')
    .then(async () => {
        console.log('✅ MongoDB Connected');
        await seedExercises();
        await seedAdmin();
    })
    .catch(err => console.error('❌ MongoDB Error:', err));

// -------------------- SERVE FRONTEND --------------------
const publicDir = path.join(__dirname, '..');
app.use(express.static(publicDir));
console.log('Serving frontend from', publicDir);

// -------------------- SCHEMAS --------------------
const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String
}, { timestamps: true });
const User = mongoose.model('User', userSchema);

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
    difficulty: { type: String, default: 'Easy' },
    category: String,
    bodyPart: String,
    reps: { type: mongoose.Schema.Types.Mixed },
    sets: { type: mongoose.Schema.Types.Mixed },
    image: String
});
const Exercise = mongoose.model('Exercise', exerciseSchema);

const routineSchema = new mongoose.Schema({
    name: { type: String, required: true },
    exercises: [{
        name: String,
        image: String,
        description: String,
        sets: mongoose.Schema.Types.Mixed,
        reps: mongoose.Schema.Types.Mixed,
        difficulty: String,
        category: String,
        bodyPart: String
    }],
    userEmail: { type: String, required: true },
    cycles: { type: Number, default: 1 }
}, { timestamps: true });
const Routine = mongoose.model('Routine', routineSchema);

const progressSchema = new mongoose.Schema({
    userEmail: String,
    routineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Routine' },
    routineName: String,
    duration: Number,
    exercises: Number,
    notes: { type: String, default: '' },
    completedAt: { type: Date, default: Date.now }
});
const Progress = mongoose.model('Progress', progressSchema);

// -------------------- SEED EXERCISES --------------------
async function seedExercises() {
    const count = await Exercise.countDocuments();
    if (count > 0) return;

    const defaults = [
        { name: 'Neck Stretch', description: 'Sit or stand up straight with your shoulders relaxed.\nSlowly tilt your head to the right, bringing your ear toward your shoulder, without raising your shoulder.\nHold this position for 15 seconds.\nSlowly return your head to the center.\nTilt to the left side and hold for another 15 seconds.\nRepeat this movement for three sets, moving gently.', bodyPart: 'neck', category: 'Neck', image: 'assets/images/neck stretch.png', sets: 3, reps: 10, difficulty: 'Easy' },
        { name: 'Shoulder Stretch', description: 'Stand straight with your feet shoulder-width apart.\nBring your right arm across your chest.\nUse your left hand to gently press the arm closer to your chest.\nHold for 20 seconds.\nRelease slowly and repeat with the left arm.\nPerform three sets for each arm, moving slowly.', bodyPart: 'shoulder', category: 'Shoulder', image: 'assets/images/Shoulder stretch.png', sets: 3, reps: 12, difficulty: 'Easy' },
        { name: 'Back Extension', description: 'Lie face down on a mat with legs extended.\nPlace your hands behind your head.\nSlowly lift your chest off the floor, keeping your neck neutral.\nHold briefly at the top.\nLower back down slowly.\nRepeat for three sets of 15 repetitions.', bodyPart: 'back', category: 'Back', image: 'assets/images/back extension.png', sets: 3, reps: 15, difficulty: 'Medium' },
        { name: 'Hand Grip', description: 'Hold a stress ball or grip trainer in one hand.\nSqueeze tightly and hold for 2-3 seconds.\nRelease slowly and let your hand relax.\nRepeat 20 times for each hand.\nComplete two sets, moving smoothly without jerking.', bodyPart: 'hands', category: 'Hand', image: 'assets/images/hand grip.png', sets: 2, reps: 20, difficulty: 'Easy' },
        { name: 'Knee Flexion', description: 'Sit on a sturdy chair with feet flat.\nLift one leg and bend your knee.\nHold for 2 seconds.\nLower your leg slowly.\nRepeat 15 times per leg.\nPerform three sets, moving gently.', bodyPart: 'knee', category: 'Knee', image: 'assets/images/knee flexion.png', sets: 3, reps: 15, difficulty: 'Medium' },
        { name: 'Leg Raise', description: 'Lie on your back with legs straight.\nLift one leg slowly to 45 degrees.\nLower it back without touching the floor.\nRepeat 12 times per leg.\nDo three sets, moving slowly and controlled.', bodyPart: 'leg', category: 'Leg', image: 'assets/images/leg raise.png', sets: 3, reps: 12, difficulty: 'Medium' },
        { name: 'Ankle Rotation', description: 'Sit or lie down with legs extended.\nRotate your right ankle clockwise 15 times.\nRotate counterclockwise 15 times.\nSwitch ankle and repeat.\nDo two sets for each ankle, moving smoothly.', bodyPart: 'ankle', category: 'Ankle', image: 'assets/images/ankle rotation.png', sets: 2, reps: 15, difficulty: 'Easy' },
        { name: 'Neck Tilt', description: 'Sit straight with shoulders relaxed.\nTilt your head slowly toward the right shoulder.\nHold for 10 seconds.\nReturn to center.\nTilt to the left shoulder and hold.\nRepeat three sets, moving gently.', bodyPart: 'neck', category: 'Neck', image: 'assets/images/neck tilt.png', sets: 3, reps: 10, difficulty: 'Easy' },
        { name: 'Shoulder Press', description: 'Stand or sit with dumbbells at shoulder height.\nPress upward until arms are straight.\nLower slowly back to shoulder level.\nRepeat 12 times.\nDo three sets, moving in a controlled manner.', bodyPart: 'shoulder', category: 'Shoulder', image: 'assets/images/shoulder press.png', sets: 3, reps: 12, difficulty: 'Medium' },
        { name: 'Back Twist', description: 'Sit on the floor with legs extended.\nBend your right knee and place your foot outside the left thigh.\nTwist your torso to the right and hold for 10 seconds.\nReturn to center.\nSwitch sides and repeat.\nDo two sets, moving gently.', bodyPart: 'back', category: 'Back', image: 'assets/images/back twist.png', sets: 2, reps: 10, difficulty: 'Easy' },
        { name: 'Wrist Circles', description: 'Extend arms in front of you.\nRotate wrists clockwise 10 times.\nRotate counterclockwise 10 times.\nRepeat for two sets, moving slowly.', bodyPart: 'hands', category: 'Hand', image: 'assets/images/wrist circle.png', sets: 2, reps: 20, difficulty: 'Easy' },
        { name: 'Squat', description: 'Stand with feet shoulder-width apart.\nLower your body as if sitting on a chair.\nKeep back straight and knees behind toes.\nReturn to standing.\nRepeat 15 times for three sets, moving carefully.', bodyPart: 'knee', category: 'Knee', image: 'assets/images/squat.png', sets: 3, reps: 15, difficulty: 'Medium' },
        { name: 'Calf Raise', description: 'Stand straight with feet shoulder-width apart.\nRaise heels off the ground and hold for 2 seconds.\nLower heels slowly.\nRepeat 20 times.\nDo three sets, moving controlled.', bodyPart: 'leg', category: 'Leg', image: 'assets/images/calf raise.png', sets: 3, reps: 20, difficulty: 'Medium' },
        { name: 'Ankle Flexion', description: 'Sit with legs extended.\nPoint toes away from the body, then pull back toward yourself.\nRepeat 15 times per ankle.\nDo three sets, moving slowly and carefully.', bodyPart: 'ankle', category: 'Ankle', image: 'assets/images/ankle flexion.png', sets: 3, reps: 15, difficulty: 'Easy' }
    ];

    await Exercise.insertMany(defaults);
    console.log('✅ Seeded', defaults.length, 'default exercises');
}

// -------------------- SEED ADMIN --------------------
async function seedAdmin() {
    const count = await Admin.countDocuments();
    if (count > 0) return;

    const hashed = await bcrypt.hash('admin123', 10);
    await new Admin({ name: 'Admin', email: 'admin@homephysio.com', password: hashed }).save();
    console.log('✅ Default admin created: admin@homephysio.com / admin123');
}

// -------------------- SESSION CHECKS --------------------
app.get('/check-session', (req, res) => {
    if (!req.session.userId) return res.json({ loggedIn: false });
    res.json({
        loggedIn: true,
        user: {
            name:  req.session.userName  || '',
            email: req.session.userEmail || ''
        }
    });
});

app.get('/admin/check-session', (req, res) => {
    if (!req.session.adminId) return res.json({ loggedIn: false });
    res.json({
        loggedIn: true,
        admin: {
            name:  req.session.adminName  || '',
            email: req.session.adminEmail || ''
        }
    });
});

// -------------------- USER AUTH --------------------
app.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password)
            return res.status(400).json({ msg: 'Please fill all fields' });

        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ msg: 'User already exists' });

        const hashed = await bcrypt.hash(password, 10);
        await new User({ name, email, password: hashed }).save();
        res.json({ msg: 'Registration successful!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ msg: 'Please fill all fields' });

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

        // Store as plain string so it round-trips through session serialization correctly
        req.session.userId    = user._id.toString();
        req.session.userName  = user.name;
        req.session.userEmail = user.email;

        return res.json({ msg: 'Login successful!', user: { name: user.name, email: user.email } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).json({ msg: 'Logout failed' });
        res.clearCookie('hp.sid');
        res.json({ msg: 'Logged out successfully' });
    });
});

app.get('/profile', async (req, res) => {
    if (!req.session.userId)
        return res.status(401).json({ msg: 'Not logged in' });
    try {
        const user = await User.findById(req.session.userId);
        if (!user) return res.status(404).json({ msg: 'User not found' });
        res.json({ name: user.name, email: user.email });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// -------------------- ADMIN AUTH --------------------
app.post('/admin/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ msg: 'Please fill all fields' });

        const admin = await Admin.findOne({ email });
        if (!admin) return res.status(400).json({ msg: 'Invalid credentials' });

        let isMatch = false;
        if (admin.password && admin.password.startsWith('$2')) {
            isMatch = await bcrypt.compare(password, admin.password);
        } else {
            isMatch = (admin.password === password);
            if (isMatch) {
                admin.password = await bcrypt.hash(password, 10);
                await admin.save();
            }
        }

        if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

        // Store as plain string so it round-trips through session serialization correctly
        req.session.adminId    = admin._id.toString();
        req.session.adminEmail = admin.email;
        req.session.adminName  = admin.name;

        return res.json({ msg: 'Admin login successful!', admin: { name: admin.name, email: admin.email } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

app.post('/admin/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).json({ msg: 'Logout failed' });
        res.clearCookie('hp.sid');
        res.json({ msg: 'Logged out' });
    });
});

app.get('/admin/profile', async (req, res) => {
    try {
        if (!req.session.adminId) return res.status(401).json({ msg: 'Not logged in as admin' });
        const admin = await Admin.findById(req.session.adminId).lean();
        if (!admin) return res.status(404).json({ msg: 'Admin not found' });
        delete admin.password;
        res.json(admin);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

app.put('/admin/update/:id', async (req, res) => {
    try {
        const { name, email, password, pic, desc } = req.body;
        const update = {};
        if (name !== undefined) update.name = name;
        if (email !== undefined) update.email = email;
        if (pic !== undefined) update.pic = pic;
        if (desc !== undefined) update.desc = desc;
        if (password) update.password = await bcrypt.hash(password, 10);

        const updated = await Admin.findByIdAndUpdate(req.params.id, update, { new: true }).lean();
        if (!updated) return res.status(404).json({ msg: 'Admin not found' });

        if (req.session && String(req.session.adminId) === String(req.params.id)) {
            req.session.adminEmail = updated.email;
            req.session.save(() => {});
        }

        delete updated.password;
        res.json({ msg: 'Admin profile updated!', admin: updated });
    } catch (err) {
        if (err.code === 11000) return res.status(400).json({ msg: 'Email already in use' });
        res.status(500).json({ msg: 'Error updating admin profile' });
    }
});

// -------------------- ADMIN DATA ENDPOINTS --------------------
app.get('/admin/users', async (req, res) => {
    if (!req.session.adminId) return res.status(401).json({ msg: 'Admin not logged in' });
    try {
        const users = await User.find({}, '-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

app.delete('/admin/users/:id', async (req, res) => {
    if (!req.session.adminId) return res.status(401).json({ msg: 'Admin not logged in' });
    try {
        const deleted = await User.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ msg: 'User not found' });
        res.json({ msg: 'User deleted' });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

app.get('/admin/progress', async (req, res) => {
    if (!req.session.adminId) return res.status(401).json({ msg: 'Admin not logged in' });
    try {
        const logs = await Progress.find({}).sort({ completedAt: -1 });
        res.json(logs);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

app.get('/admin/routines', async (req, res) => {
    if (!req.session.adminId) return res.status(401).json({ msg: 'Admin not logged in' });
    try {
        const routines = await Routine.find({}).sort({ createdAt: -1 });
        res.json(routines);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

app.get('/admin/stats', async (req, res) => {
    if (!req.session.adminId) return res.status(401).json({ msg: 'Admin not logged in' });
    try {
        const [exercises, users, workouts, routines] = await Promise.all([
            Exercise.countDocuments(),
            User.countDocuments(),
            Progress.countDocuments(),
            Routine.countDocuments()
        ]);
        res.json({ exercises, users, workouts, routines });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// -------------------- EXERCISES CRUD --------------------
app.get('/api/exercises', async (req, res) => {
    try {
        const exercises = await Exercise.find();
        res.json(exercises);
    } catch (err) {
        res.status(500).json({ msg: 'Failed to fetch exercises' });
    }
});

app.post('/api/exercises', async (req, res) => {
    try {
        const ex = new Exercise(req.body);
        await ex.save();
        res.json(ex);
    } catch (err) {
        res.status(500).json({ msg: 'Failed to add exercise' });
    }
});

app.put('/api/exercises/:id', async (req, res) => {
    try {
        const updated = await Exercise.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(404).json({ msg: 'Exercise not found' });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ msg: 'Failed to update exercise' });
    }
});

app.delete('/api/exercises/:id', async (req, res) => {
    try {
        const deleted = await Exercise.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ msg: 'Exercise not found' });
        res.json({ msg: 'Exercise deleted' });
    } catch (err) {
        res.status(500).json({ msg: 'Failed to delete exercise' });
    }
});

// -------------------- ROUTINES --------------------
app.get('/routines', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ msg: 'Not logged in' });
    try {
        const user = await User.findById(req.session.userId);
        if (!user) return res.status(401).json({ msg: 'User not found' });
        const routines = await Routine.find({ userEmail: user.email }).sort({ createdAt: -1 });
        res.json(routines);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

app.get('/routines/:id', async (req, res) => {
    try {
        const routine = await Routine.findById(req.params.id);
        if (!routine) return res.status(404).json({ msg: 'Routine not found' });
        res.json(routine);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

app.post('/routines', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ msg: 'Not logged in' });
    try {
        const { name, cycles } = req.body;
        if (!name) return res.status(400).json({ msg: 'Routine name is required' });

        const user = await User.findById(req.session.userId);
        if (!user) return res.status(401).json({ msg: 'User not found' });

        const routine = new Routine({ name, exercises: [], userEmail: user.email, cycles: cycles || 1 });
        await routine.save();
        res.json({ msg: 'Routine created', routine });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

app.delete('/routines/:id', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ msg: 'Not logged in' });
    try {
        const deleted = await Routine.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ msg: 'Routine not found' });
        res.json({ msg: 'Routine deleted' });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// Add exercise to routine
app.post('/routines/:id/exercises', async (req, res) => {
    try {
        const { exercise } = req.body;
        if (!exercise) return res.status(400).json({ msg: 'No exercise provided' });

        const routine = await Routine.findById(req.params.id);
        if (!routine) return res.status(404).json({ msg: 'Routine not found' });

        routine.exercises.push(exercise);
        await routine.save();
        res.json({ msg: 'Exercise added', routine });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// Remove exercise from routine
app.delete('/routines/:id/exercises/:exerciseId', async (req, res) => {
    try {
        const routine = await Routine.findById(req.params.id);
        if (!routine) return res.status(404).json({ msg: 'Routine not found' });

        routine.exercises = routine.exercises.filter(
            ex => String(ex._id) !== req.params.exerciseId
        );
        await routine.save();
        res.json({ msg: 'Exercise removed', routine });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// Keep old addExercise route for compatibility
app.post('/routines/:id/addExercise', async (req, res) => {
    try {
        const { exercise } = req.body;
        if (!exercise) return res.status(400).json({ msg: 'No exercise provided' });

        const routine = await Routine.findById(req.params.id);
        if (!routine) return res.status(404).json({ msg: 'Routine not found' });

        routine.exercises.push(exercise);
        await routine.save();
        res.json({ msg: 'Exercise added', routine });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// -------------------- PROGRESS --------------------
app.post('/progress', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ msg: 'Not logged in' });
    try {
        const user = await User.findById(req.session.userId);
        if (!user) return res.status(401).json({ msg: 'User not found' });

        const { routineId, routineName, duration, exercises, notes } = req.body;
        const log = new Progress({
            userEmail: user.email,
            routineId,
            routineName,
            duration: duration || 0,
            exercises: exercises || 0,
            notes: notes || ''
        });
        await log.save();
        res.json({ msg: 'Progress saved', log });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

app.get('/progress', async (req, res) => {
    if (!req.session.userId) return res.status(401).json({ msg: 'Not logged in' });
    try {
        const user = await User.findById(req.session.userId);
        if (!user) return res.status(401).json({ msg: 'User not found' });

        const logs = await Progress.find({ userEmail: user.email }).sort({ completedAt: -1 });
        res.json(logs);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// -------------------- DEBUG --------------------
app.get('/debug/session', (req, res) => {
    res.json({ sessionID: req.sessionID, session: req.session, cookieHeader: req.headers.cookie });
});

// -------------------- START --------------------
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
