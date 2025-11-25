/* ==================== GLOBAL STATE ==================== */
let adminData = null;
let exercises = [];
let users = [];
let routines = [];
let currentExerciseId = null; // Track edit mode

/* ==================== HEADER & UI ==================== */
document.getElementById('headerPic').onclick = () => showSection('profile');

function showToast(msg) {
    const t = document.getElementById('toast');
    t.innerText = msg;
    t.className = "toast show";
    setTimeout(() => t.className = "toast", 3000);
}

function toggleTheme() {
    document.body.classList.toggle('dark');
    const icon = document.getElementById('themeToggle');
    if (document.body.classList.contains('dark')) {
        icon.classList.replace('fa-sun', 'fa-moon');
    } else {
        icon.classList.replace('fa-moon', 'fa-sun');
    }
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

async function logout() {
    try {
        await fetch(`${API_BASE_URL}/logout`, { method: "POST" });
        showToast("Logged out successfully!");
        setTimeout(() => window.location.href = "index.html", 1500);
    } catch (err) {
        console.error("Logout failed", err);
        window.location.href = "index.html";
    }
}

/* ==================== DATA FETCHING ==================== */
async function fetchData() {
    await Promise.all([loadAdminProfile(), loadUsers(), loadExercises(), loadRoutines()]);
    updateDashboardCounts();
}

async function loadAdminProfile() {
    try {
        const res = await fetch(`${API_BASE_URL}/admin/profile`, { credentials: "include" });
        if (res.status === 401) {
            window.location.href = "adminlogin.html";
            return;
        }
        if (!res.ok) throw new Error("Failed to load profile");

        adminData = await res.json();
        renderProfile();
    } catch (err) {
        console.error(err);
    }
}

async function loadUsers() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/users`);
        if (res.ok) {
            users = await res.json();
            renderUsersTable();
        }
    } catch (err) {
        console.error("Error loading users", err);
    }
}

async function loadExercises() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/exercises`);
        if (res.ok) {
            exercises = await res.json();
            renderExercisesTable();
        }
    } catch (err) {
        console.error("Error loading exercises", err);
    }
}

async function loadRoutines() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/routines`);
        if (res.ok) {
            routines = await res.json();
            renderRoutinesTable();
        }
    } catch (err) {
        console.error("Error loading routines", err);
    }
}

/* ==================== RENDERING ==================== */
function renderProfile() {
    if (!adminData) return;

    // Default values if missing
    const name = adminData.name || "Admin";
    const email = adminData.email || "admin@homephysio.com";
    const desc = adminData.desc || "Managing the physiotherapy app efficiently."; // Note: 'desc' might not be in schema yet
    const pic = adminData.pic || "https://cdn-icons-png.flaticon.com/512/149/149071.png"; // Note: 'pic' might not be in schema yet

    // View Mode
    document.getElementById('viewName').innerText = name;
    document.getElementById('viewEmail').innerText = email;
    document.getElementById('viewDesc').innerText = desc;
    document.getElementById('viewPic').src = pic;

    // Header & Sidebar
    document.getElementById('headerPic').src = pic;
    document.getElementById('sidebarPic').src = pic;
    document.getElementById('sidebarGreeting').innerText = `Hello, ${name} 👋`;

    // Edit Mode Inputs
    document.getElementById('adminName').value = name;
    document.getElementById('adminEmail').value = email;
    document.getElementById('adminDesc').value = desc;
}

function renderUsersTable() {
    const tbody = document.getElementById("users-table");
    if (!tbody) return;
    tbody.innerHTML = users.map((u, i) => `
        <tr>
            <td>${i + 1}</td>
            <td>${u.name}</td>
            <td>${u.email}</td>
            <td>********</td>
            <td>
                <button class='btn delete' onclick='deleteUser("${u._id}")'>Delete</button>
            </td>
        </tr>
    `).join("");
}

function renderExercisesTable() {
    const tbody = document.getElementById("exercises-table");
    if (!tbody) return;
    tbody.innerHTML = exercises.map((e, i) => `
        <tr>
            <td>${i + 1}</td>
            <td>${e.name}</td>
            <td>${e.category}</td>
            <td>${e.reps}</td>
            <td>${e.sets}</td>
            <td class="description" title="${e.description}">${e.description}</td>
            <td>${e.image ? '<img src="' + e.image + '" style="width:40px;height:40px;border-radius:5px;">' : ''}</td>
            <td>${e.difficulty}</td>
            <td>
                <button class='btn edit' onclick='editExercise("${e._id}")'>Edit</button>
                <button class='btn delete' onclick='deleteExercise("${e._id}")'>Delete</button>
            </td>
        </tr>
    `).join("");
}

function renderRoutinesTable() {
    const tbody = document.getElementById("routines-table");
    if (!tbody) return;
    tbody.innerHTML = routines.map((r, i) => `
        <tr>
            <td>${i + 1}</td>
            <td>${r.name}</td>
            <td>${r.userEmail}</td>
            <td>
                <button class='btn delete' onclick='deleteRoutine("${r._id}")'>Delete</button>
            </td>
        </tr>
    `).join("");
}

function updateDashboardCounts() {
    const uc = document.getElementById("userCount");
    const ec = document.getElementById("exerciseCount");
    const rc = document.getElementById("routineCount");

    if (uc) uc.innerText = users.length;
    if (ec) ec.innerText = exercises.length;
    if (rc) rc.innerText = routines.length;
}

/* ==================== ACTIONS ==================== */

// --- Profile ---
function toggleEditProfile(edit) {
    document.getElementById('profileView').style.display = edit ? 'none' : 'block';
    document.getElementById('profileEdit').style.display = edit ? 'block' : 'none';
}

function updateProfilePic(e) {
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
        // Preview only, not saved yet
        document.getElementById('viewPic').src = r.result;
    };
    r.readAsDataURL(f);
}

async function saveProfile() {
    const name = document.getElementById('adminName').value;
    const email = document.getElementById('adminEmail').value;
    const desc = document.getElementById('adminDesc').value;
    const pic = document.getElementById('viewPic').src; // Get the src (base64)

    try {
        const res = await fetch(`${API_BASE_URL}/admin/update/${adminData._id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, pic, desc }) // Note: Backend needs to support 'desc' and 'pic' in Admin model
        });

        if (res.ok) {
            showToast("Profile updated!");
            loadAdminProfile(); // Reload to confirm
            toggleEditProfile(false);
        } else {
            showToast("Failed to update profile");
        }
    } catch (err) {
        console.error(err);
        showToast("Error saving profile");
    }
}

// --- Exercises ---
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
                ? `${API_BASE_URL}/api/exercises/${currentExerciseId}`
                : `${API_BASE_URL}/api/exercises`;
            const method = currentExerciseId ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(exerciseData)
            });

            if (!res.ok) throw new Error("Failed to save exercise");

            currentExerciseId = null;
            closeModal('exerciseModal');
            clearExerciseForm();
            showToast("Exercise saved!");
            loadExercises(); // Refresh list
            updateDashboardCounts();
        } catch (err) {
            console.error(err);
            showToast("Error saving exercise");
        }
    };

    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => processExercise(e.target.result);
        reader.readAsDataURL(file);
    } else {
        // If editing and no new file, keep old image? 
        // For simplicity, if no file and editing, we might need to handle keeping the old image.
        // But the backend PUT replaces the whole object usually. 
        // Let's assume for now we just send what we have. 
        // Ideally we should check if we are editing and use the existing image if 'file' is null.
        if (currentExerciseId) {
            const existing = exercises.find(e => e._id === currentExerciseId);
            processExercise(existing ? existing.image : null);
        } else {
            processExercise(null);
        }
    }
}

function editExercise(id) {
    const e = exercises.find(ex => ex._id === id);
    if (!e) return;

    currentExerciseId = id;
    document.getElementById('exerciseName').value = e.name;
    document.getElementById('exerciseDesc').value = e.description;
    document.getElementById('exerciseDiff').value = e.difficulty;
    document.getElementById('exerciseCategory').value = e.category;
    document.getElementById('exerciseReps').value = e.reps;
    document.getElementById('exerciseSets').value = e.sets;
    document.getElementById('exerciseImage').value = ''; // Reset file input

    openModal('exerciseModal');
}

async function deleteExercise(id) {
    if (!confirm("Are you sure?")) return;
    try {
        const res = await fetch(`${API_BASE_URL}/api/exercises/${id}`, { method: "DELETE" });
        if (res.ok) {
            showToast("Exercise deleted");
            loadExercises();
            updateDashboardCounts();
        } else {
            showToast("Failed to delete");
        }
    } catch (err) {
        console.error(err);
        showToast("Error deleting exercise");
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
    currentExerciseId = null;
}

// --- Users ---
async function deleteUser(id) {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
        const res = await fetch(`${API_BASE_URL}/api/users/${id}`, { method: "DELETE" });
        if (res.ok) {
            showToast("User deleted");
            loadUsers();
            updateDashboardCounts();
        } else {
            showToast("Failed to delete user");
        }
    } catch (err) {
        console.error(err);
        showToast("Error deleting user");
    }
}

// --- Routines ---
async function deleteRoutine(id) {
    if (!confirm("Are you sure you want to delete this routine?")) return;
    try {
        const res = await fetch(`${API_BASE_URL}/api/routines/${id}`, { method: "DELETE" });
        if (res.ok) {
            showToast("Routine deleted");
            loadRoutines();
            updateDashboardCounts();
        } else {
            showToast("Failed to delete routine");
        }
    } catch (err) {
        console.error(err);
        showToast("Error deleting routine");
    }
}


/* ==================== INITIAL LOAD ==================== */
window.onload = fetchData;
