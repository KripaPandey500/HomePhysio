/* ==================== HEADER ==================== */
document.getElementById('headerPic').onclick = () => showSection('profile');

/* ==================== DATABASE ==================== */
let db = JSON.parse(localStorage.getItem("db") || '{"users":[],"exercises":[],"routines":[],"profile":{}}');
let currentAdminId = null; // MongoDB admin _id when loaded from server
let currentExerciseId = null; // ✅ Track edit mode

/* ==================== TOAST & UI ==================== */
function showToast(msg) {
    const t = document.getElementById('toast');
    t.innerText = msg;
    t.className = "toast show";
    setTimeout(() => t.className = "toast", 3000);
}

function toggleTheme() {
    document.body.classList.toggle('dark');
    document.getElementById('themeToggle').classList.toggle('fa-moon');
    document.getElementById('themeToggle').classList.toggle('fa-sun');
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('collapsed');
}

function showSection(id, el) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active-section'));
    document.getElementById(id).classList.add('active-section');

    if (el) {
        document.querySelectorAll('.sidebar ul li').forEach(li => li.classList.remove('active'));
        el.classList.add('active');
    }

    document.getElementById('section-title').innerText = id.charAt(0).toUpperCase() + id.slice(1);
}

function openModal(id) {
    document.getElementById(id).style.display = 'block';
}

function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}

function logout() {
    showToast("Logged out successfully!");
    setTimeout(() => window.location.href = "index.html", 1500);
}

/* ==================== PROFILE ==================== */
function toggleEditProfile(edit) {
    document.getElementById('profileView').style.display = edit ? 'none' : 'block';
    document.getElementById('profileEdit').style.display = edit ? 'block' : 'none';
}

function updateProfilePic(e) {
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
        // Use DOM elements explicitly
        const viewPic = document.getElementById('viewPic');
        const headerPic = document.getElementById('headerPic');
        const sidebarPic = document.getElementById('sidebarPic');
        viewPic.src = headerPic.src = sidebarPic.src = r.result;
    };
    r.readAsDataURL(f);
}

function saveProfile() {
    const name = document.getElementById('adminName').value.trim();
    const email = document.getElementById('adminEmail').value.trim();
    const desc = document.getElementById('adminDesc').value.trim();
    const pic = document.getElementById('viewPic').src;
    const newPassword = document.getElementById('adminPassword') ? document.getElementById('adminPassword').value : null;

    if (!currentAdminId) {
        showToast('Admin ID not loaded; ensure you are logged in as admin (open via http://localhost:5000/).');
        return;
    }

    const body = { name, email, pic, desc };
    if (newPassword && newPassword.length >= 6) body.password = newPassword; // optional password update

    fetch(`http://localhost:5000/admin/update/${currentAdminId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body)
    }).then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.msg || 'Failed to update admin');

        // Update UI from server response for truth
        const admin = data.admin || {};
        document.getElementById('viewName').innerText = admin.name || name;
        document.getElementById('viewEmail').innerText = admin.email || email;
        document.getElementById('viewDesc').innerText = admin.desc || desc;
        document.getElementById('viewPic').src =
            document.getElementById('headerPic').src =
            document.getElementById('sidebarPic').src = admin.pic || pic;

        showToast('Profile saved!');
        toggleEditProfile(false);
    }).catch(err => {
        console.error(err);
        showToast(err.message || 'Error saving profile!');
    });
}

function loadProfile() {
    // Try loading admin profile from backend (requires admin session)
   fetch('http://localhost:5000/admin/profile', { credentials: 'include' })
    .then(async res => {
        if (!res.ok) {
            throw new Error("No admin session");
        }
const admin = await res.json();


            currentAdminId = admin._id || admin.id || null;

            document.getElementById('viewName').innerText = document.getElementById('adminName').value = admin.name || 'Admin';
            document.getElementById('viewEmail').innerText = document.getElementById('adminEmail').value = admin.email || 'admin@homephysio.com';
            document.getElementById('viewDesc').innerText = document.getElementById('adminDesc').value = admin.desc || 'Managing the physiotherapy app efficiently.';
            document.getElementById('viewPic').src =
                document.getElementById('headerPic').src =
                document.getElementById('sidebarPic').src = admin.pic || 'https://cdn-icons-png.flaticon.com/512/149/149071.png';

            document.getElementById('sidebarGreeting').innerText = `Hello, ${admin.name || 'Admin'} 👋`;
        })
        .catch(() => {
            // Fallback to IndexedDB/local defaults if backend not available
            const transaction = db.transaction ? db.transaction : null; // keep original logic if indexedDB used
            // set defaults
            document.getElementById('viewName').innerText = document.getElementById('adminName').value = 'Admin';
            document.getElementById('viewEmail').innerText = document.getElementById('adminEmail').value = 'admin@homephysio.com';
            document.getElementById('viewDesc').innerText = document.getElementById('adminDesc').value = 'Managing the physiotherapy app efficiently.';
            document.getElementById('viewPic').src = document.getElementById('headerPic').src = document.getElementById('sidebarPic').src = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
            document.getElementById('sidebarGreeting').innerText = `Hello, Admin 👋`;
        });
}

/* ==================== TABLE FUNCTIONS ==================== */
function updateTables() {
    const et = document.getElementById("exercises-table");
    if (et) {
        et.innerHTML = db.exercises.map((e, i) => `
            <tr>
                <td>${i + 1}</td>
                <td>${e.name}</td>
                <td>${e.category}</td>
                <td>${e.reps}</td>
                <td>${e.sets}</td>
                <td class="description" title="${e.description}">${e.description}</td>
                <td>${e.image ? '<img src="'+e.image+'" style="width:40px;height:40px;border-radius:5px;">' : ''}</td>
                <td>${e.difficulty}</td>
                <td>
                    <button class='btn edit' onclick='editExercise(${i})'>Edit</button>
                    <button class='btn delete' onclick='deleteExercise(${i})'>Delete</button>
                </td>
            </tr>
        `).join("");
    }

    const uc = document.getElementById("userCount");
    const ec = document.getElementById("exerciseCount");
    const rc = document.getElementById("routineCount");

    if (uc) uc.innerText = db.users.length;
    if (ec) ec.innerText = db.exercises.length;
    if (rc) rc.innerText = db.routines.length;
}

function saveAndUpdate() {
    localStorage.setItem('db', JSON.stringify(db));
    updateTables();
}

/* ==================== EXERCISES ==================== */
async function addExercise() {
    const name = document.getElementById('exerciseName').value.trim();
    const desc = document.getElementById('exerciseDesc').value.trim();
    const diff = document.getElementById('exerciseDiff').value;
    const category = document.getElementById('exerciseCategory').value;
    const reps = document.getElementById('exerciseReps').value;
    const sets = document.getElementById('exerciseSets').value;
    const file = document.getElementById('exerciseImage').files[0];

    if (!name || !desc || !category || !reps || !sets) {
        showToast("Please fill all fields");
        return;
    }

    const processExercise = async (imageData) => {
        const exerciseData = { name, description: desc, difficulty: diff, category, reps, sets, image: imageData };

        try {
            const url = currentExerciseId 
                ? `http://localhost:5000/api/exercises/${currentExerciseId}` 
                : "http://localhost:5000/api/exercises";
            const method = currentExerciseId ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(exerciseData)
            });

            if (!res.ok) throw new Error("Failed to save exercise in MongoDB");

            currentExerciseId = null; // reset edit mode

            const refresh = await fetch("http://localhost:5000/api/exercises");
            db.exercises = await refresh.json();

            saveAndUpdate();
            updateTables();
            closeModal('exerciseModal');
            clearExerciseForm();

            showToast("Exercise saved successfully!");
        } catch (err) {
            console.error(err);
            showToast("Error adding exercise!");
        }
    };

    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => processExercise(e.target.result);
        reader.readAsDataURL(file);
    } else {
        processExercise(null);
    }
}

function editExercise(index) {
    const e = db.exercises[index];
    currentExerciseId = e._id; // ✅ Save MongoDB ID for PUT request

    document.getElementById('exerciseName').value = e.name;
    document.getElementById('exerciseDesc').value = e.description;
    document.getElementById('exerciseDiff').value = e.difficulty;
    document.getElementById('exerciseCategory').value = e.category;
    document.getElementById('exerciseReps').value = e.reps;
    document.getElementById('exerciseSets').value = e.sets;
    document.getElementById('exerciseImage').value = '';

    openModal('exerciseModal');
}

async function deleteExercise(index) {
    const exercise = db.exercises[index];
    if (!exercise || !exercise._id) return showToast("Invalid exercise!");

    if (confirm("Are you sure you want to delete this exercise?")) {
        try {
            const res = await fetch(`http://localhost:5000/api/exercises/${exercise._id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete exercise in MongoDB");

            db.exercises.splice(index, 1);
            saveAndUpdate();
            updateTables();
            showToast("Exercise deleted!");
        } catch (err) {
            console.error(err);
            showToast("Error deleting exercise!");
        }
    }
}

function clearExerciseForm() {
    document.getElementById('exerciseName').value = '';
    document.getElementById('exerciseDesc').value = '';
    document.getElementById('exerciseDiff').value = 'Easy';
    document.getElementById('exerciseCategory').value = '';
    document.getElementById('exerciseReps').value = '';
    document.getElementById('exerciseSets').value = '';
    document.getElementById('exerciseImage').value = '';
}

/* ==================== INITIAL LOAD ==================== */
window.onload = async () => {
    loadProfile();
    try {
        const res = await fetch("http://localhost:5000/api/exercises");
        db.exercises = await res.json();
    } catch (err) {
        console.error("Failed to load exercises:", err);
    }
    saveAndUpdate();
};
