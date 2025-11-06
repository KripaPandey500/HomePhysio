/* ==================== HEADER ==================== */
document.getElementById('headerPic').onclick = () => showSection('profile');

/* ==================== DATABASE ==================== */
let db = JSON.parse(localStorage.getItem("db") || '{"users":[],"exercises":[],"routines":[],"profile":{}}');

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
        adminPic.src = headerPic.src = sidebarPic.src = viewPic.src = r.result;
    };
    r.readAsDataURL(f);
}

function saveProfile() {
    let name = document.getElementById('adminName').value;
    let email = document.getElementById('adminEmail').value;
    let desc = document.getElementById('adminDesc').value;
    let pic = document.getElementById('adminPic') ? document.getElementById('adminPic').src : viewPic.src;

    db.profile = { name, email, desc, pic };
    saveAndUpdate();

    document.getElementById('sidebarGreeting').innerText = `Hello, ${name} 👋`;
    document.getElementById('viewName').innerText = name;
    document.getElementById('viewEmail').innerText = email;
    document.getElementById('viewDesc').innerText = desc;
    document.getElementById('viewPic').src = document.getElementById('headerPic').src = document.getElementById('sidebarPic').src = pic;

    localStorage.setItem("loggedInEmail", email);
    toggleEditProfile(false);
    showToast("Profile Saved");
}

function loadProfile() {
    const p = db.profile || {};
    const loggedInEmail = localStorage.getItem("loggedInEmail") || p.email || "admin@homephysio.com";

    document.getElementById('viewEmail').innerText = document.getElementById('adminEmail').value = loggedInEmail;
    document.getElementById('viewName').innerText = document.getElementById('adminName').value = p.name || "Admin";
    document.getElementById('viewDesc').innerText = document.getElementById('adminDesc').value = p.desc || "Managing the physiotherapy app efficiently.";

    const pic = p.pic || "https://cdn-icons-png.flaticon.com/512/149/149071.png";
    document.getElementById('viewPic').src = document.getElementById('headerPic').src = document.getElementById('sidebarPic').src = document.getElementById('adminPic') ? document.getElementById('adminPic').src = pic : pic;

    document.getElementById('sidebarGreeting').innerText = `Hello, ${p.name || "Admin"} 👋`;
}

/* ==================== TABLE FUNCTIONS ==================== */
function updateTables() {
    // ===== Users Table =====
    const ut = document.getElementById("users-table");
    if (ut) {
        ut.innerHTML = db.users.map((u, i) => `
            <tr>
                <td>${i + 1}</td>
                <td>${u.name}</td>
                <td>${u.email}</td>
                <td>${u.password || '*****'}</td>
                <td>
                    <button class='btn edit' onclick='editUser(${i})'>Edit</button>
                    <button class='btn delete' onclick='deleteUser(${i})'>Delete</button>
                </td>
            </tr>
        `).join("");
    }

    // ===== Exercises Table =====
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

    // ===== Routines Table =====
    const rt = document.getElementById("routines-table");
    if (rt) {
        rt.innerHTML = db.routines.map((r, i) => `
            <tr>
                <td>${i + 1}</td>
                <td>${r.name}</td>
                <td>${r.email || 'N/A'}</td>
                <td>
                    <button class='btn delete' onclick='deleteRoutine(${i})'>Delete</button>
                </td>
            </tr>
        `).join("");
    }

    // ===== Update Counts =====
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

/* ==================== USERS ==================== */
function deleteUser(index) {
    if (confirm("Are you sure you want to delete this user?")) {
        db.users.splice(index, 1);
        saveAndUpdate();
        showToast("User deleted!");
    }
}

/* ==================== EXERCISES ==================== */
let currentExerciseIndex = null;

function addExercise() {
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

    const processExercise = (imageData) => {
        if (currentExerciseIndex !== null) {
            db.exercises[currentExerciseIndex] = { name, description: desc, difficulty: diff, category, reps, sets, image: imageData };
            showToast("Exercise updated!");
            currentExerciseIndex = null;
        } else {
            db.exercises.push({ name, description: desc, difficulty: diff, category, reps, sets, image: imageData });
            showToast("Exercise added!");
        }

        saveAndUpdate(); // <-- ensures table refresh immediately
        closeModal('exerciseModal');
        clearExerciseForm();
    };

    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => processExercise(e.target.result);
        reader.readAsDataURL(file);
    } else {
        const imageData = currentExerciseIndex !== null && db.exercises[currentExerciseIndex]?.image ? db.exercises[currentExerciseIndex].image : null;
        processExercise(imageData);
    }
}


function editExercise(index) {
    currentExerciseIndex = index;
    const e = db.exercises[index];
    document.getElementById('exerciseName').value = e.name;
    document.getElementById('exerciseDesc').value = e.description;
    document.getElementById('exerciseDiff').value = e.difficulty;
    document.getElementById('exerciseCategory').value = e.category;
    document.getElementById('exerciseReps').value = e.reps;
    document.getElementById('exerciseSets').value = e.sets;
    document.getElementById('exerciseImage').value = '';
    openModal('exerciseModal');
}

function deleteExercise(index) {
    if (confirm("Are you sure you want to delete this exercise?")) {
        db.exercises.splice(index, 1);
        saveAndUpdate();
        showToast("Exercise deleted!");
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

/* ==================== ROUTINES ==================== */
function deleteRoutine(index) {
    if (confirm("Are you sure you want to delete this routine?")) {
        db.routines.splice(index, 1);
        saveAndUpdate();
        showToast("Routine deleted!");
    }
}

/* ==================== INITIAL LOAD ==================== */
window.onload = async () => {
    loadProfile();

    if (typeof loadUsersFromServer === 'function') await loadUsersFromServer();

    updateTables(); 
};
