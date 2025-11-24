/* ==================== HEADER ==================== */
document.getElementById('headerPic').onclick = () => showSection('profile');

/* ==================== DATABASE ==================== */
let db = JSON.parse(localStorage.getItem("db") || '{"users":[],"exercises":[],"routines":[],"profile":{}}');
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
        adminPic.src = headerPic.src = sidebarPic.src = viewPic.src = r.result;
    };
    r.readAsDataURL(f);
}

function saveProfile() {
    const name = document.getElementById('adminName').value;
    const email = document.getElementById('adminEmail').value;
    const desc = document.getElementById('adminDesc').value;
    const pic = document.getElementById('viewPic').src;

    const transaction = db.transaction(["admin"], "readwrite");
    const store = transaction.objectStore("admin");

    store.put({ email, name, desc, pic }); // update or insert

    transaction.oncomplete = () => {
        console.log("Admin profile updated in IndexedDB");

        document.getElementById('viewName').innerText = name;
        document.getElementById('viewEmail').innerText = email;
        document.getElementById('viewDesc').innerText = desc;
        document.getElementById('viewPic').src =
        document.getElementById('headerPic').src =
        document.getElementById('sidebarPic').src = pic;

        showToast("Profile saved!");
        toggleEditProfile(false);
    };

    transaction.onerror = () => showToast("Error saving profile!");
}


function loadProfile() {
    const transaction = db.transaction(["admin"], "readonly");
    const store = transaction.objectStore("admin");

    const request = store.getAll();

    request.onsuccess = () => {
        const admins = request.result;
        const admin = admins[0] || { name: "Admin", email: "admin@homephysio.com", desc: "Managing the physiotherapy app efficiently.", pic: "https://cdn-icons-png.flaticon.com/512/149/149071.png" };

        document.getElementById('viewName').innerText = document.getElementById('adminName').value = admin.name;
        document.getElementById('viewEmail').innerText = document.getElementById('adminEmail').value = admin.email;
        document.getElementById('viewDesc').innerText = document.getElementById('adminDesc').value = admin.desc;
        document.getElementById('viewPic').src =
        document.getElementById('headerPic').src =
        document.getElementById('sidebarPic').src = admin.pic;

        document.getElementById('sidebarGreeting').innerText = `Hello, ${admin.name} 👋`;
    };
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
