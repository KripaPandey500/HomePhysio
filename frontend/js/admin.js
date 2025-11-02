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
    let name = adminName.value,
        email = adminEmail.value,
        desc = adminDesc.value,
        pic = adminPic.src;

    db.profile = { name, email, desc, pic };
    saveAndUpdate();

    sidebarGreeting.innerText = `Hello, ${name} 👋`;
    viewName.innerText = name;
    viewEmail.innerText = email;
    viewDesc.innerText = desc;
    viewPic.src = headerPic.src = sidebarPic.src = pic;

    localStorage.setItem("loggedInEmail", email);
    toggleEditProfile(false);
    showToast("Profile Saved");
}

function loadProfile() {
    const p = db.profile || {};
    const loggedInEmail = localStorage.getItem("loggedInEmail") || p.email || "admin@homephysio.com";

    viewEmail.innerText = adminEmail.value = loggedInEmail;
    viewName.innerText = adminName.value = p.name || "Admin";
    viewDesc.innerText = adminDesc.value = p.desc || "Managing the physiotherapy app efficiently.";

    const pic = p.pic || "https://cdn-icons-png.flaticon.com/512/149/149071.png";
    viewPic.src = headerPic.src = sidebarPic.src = adminPic.src = pic;

    sidebarGreeting.innerText = `Hello, ${p.name || "Admin"} 👋`;
}

/* ==================== TABLE FUNCTIONS ==================== */
function updateTables() {
    // Users Table
    const ut = document.getElementById("users-table");
    ut.innerHTML = db.users.map((u, i) => `
        <tr>
            <td>${i + 1}</td>
            <td>${u.name}</td>
            <td>${u.email}</td>
            <td>${u.image ? '<img src="'+u.image+'" style="width:40px;height:40px;border-radius:50%;">' : ''}</td>
            <td>
                <button class='btn edit' onclick='editUser(${i})'>Edit</button>
                <button class='btn delete' onclick='deleteUser(${i})'>Delete</button>
            </td>
        </tr>
    `).join("");

    // Exercises Table
    const et = document.getElementById("exercises-table");
    et.innerHTML = db.exercises.map((e, i) => `
        <tr>
            <td>${i+1}</td>
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

    // Routines Table
    const rt = document.getElementById("routines-table");
    rt.innerHTML = db.routines.map((r, i) => `
        <tr>
            <td>${i+1}</td>
            <td>${r.name}</td>
            <td>${r.exercises}</td>
            <td>${r.image ? '<img src="'+r.image+'" style="width:40px;height:40px;border-radius:5px;">' : ''}</td>
            <td>${r.progress}</td>
            <td>${new Date(r.createdAt).toLocaleDateString()}</td>
            <td>
                <button class='btn edit' onclick='editRoutine(${i})'>Edit</button>
                <button class='btn delete' onclick='deleteRoutine(${i})'>Delete</button>
            </td>
        </tr>
    `).join("");

    // Counts
    document.getElementById("userCount").innerText = db.users.length;
    document.getElementById("exerciseCount").innerText = db.exercises.length;
    document.getElementById("routineCount").innerText = db.routines.length;
}

function saveAndUpdate() {
    localStorage.setItem('db', JSON.stringify(db));
    updateTables();
}

/* ==================== USERS ==================== */
let currentUserIndex = null;

async function addUser() {
    const name = document.getElementById('userName').value;
    const email = document.getElementById('userEmail').value;

    if (!name || !email) { showToast("Please fill all fields"); return; }

    const newUser = { name, email, image: null };

    try {
        const res = await fetch('http://localhost:5000/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newUser)
        });

        if (!res.ok) throw new Error("Server error");

        const savedUser = await res.json();
        db.users.push(savedUser);   // update local db after server success
        saveAndUpdate();
        closeModal('userModal');
        showToast("User added!");
        document.getElementById('userName').value = '';
        document.getElementById('userEmail').value = '';
    } catch (err) {
        console.error(err);
        showToast("Failed to add user!");
    }
}

function editUser(index) {
    currentUserIndex = index;
    const user = db.users[index];
    document.getElementById('userName').value = user.name;
    document.getElementById('userEmail').value = user.email;
    document.getElementById('userImage').value = '';
    openModal('userModal');
}

function deleteUser(index) {
    if (confirm("Are you sure you want to delete this user?")) {
        db.users.splice(index, 1);
        saveAndUpdate();
        showToast("User deleted!");
    }
}

async function loadUsersFromServer() {
    try {
        const res = await fetch("http://localhost:5000/users");
        const data = await res.json();
        db.users = data; // Update db
        localStorage.setItem("db", JSON.stringify(db));
        updateTables();
    } catch (err) {
        console.error("Failed to load users:", err);
    }
}

/* ==================== EXERCISES ==================== */
let currentExerciseIndex = null;

function addExercise() {
    const name = document.getElementById('exerciseName').value;
    const desc = document.getElementById('exerciseDesc').value;
    const diff = document.getElementById('exerciseDiff').value;
    const category = document.getElementById('exerciseCategory').value;
    const reps = document.getElementById('exerciseReps').value;
    const sets = document.getElementById('exerciseSets').value;
    const file = document.getElementById('exerciseImage').files[0];

    if (!name || !desc || !category || !reps || !sets) {
        showToast("Please fill all fields");
        return;
    }

    const process = (imageData) => {
        if (currentExerciseIndex !== null) {
            db.exercises[currentExerciseIndex] = { name, description: desc, difficulty: diff, category, reps, sets, image: imageData };
            showToast("Exercise updated!");
            currentExerciseIndex = null;
        } else {
            db.exercises.push({ name, description: desc, difficulty: diff, category, reps, sets, image: imageData });
            showToast("Exercise added!");
        }
        saveAndUpdate();
        closeModal('exerciseModal');
        clearExerciseForm();
    };

    if (file) {
        const reader = new FileReader();
        reader.onload = () => process(reader.result);
        reader.readAsDataURL(file);
    } else {
        const imageData = currentExerciseIndex !== null && db.exercises[currentExerciseIndex].image ? db.exercises[currentExerciseIndex].image : null;
        process(imageData);
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
let currentRoutineIndex = null;
function addRoutine() {
    const name = document.getElementById('routineName').value;
    const files = document.getElementById('routineExercises').files;
    const progress = document.getElementById('routineProgress').value;

    if (!name) { showToast("Routine name required"); return; }

    const images = [];

    const processRoutine = () => {
        if (currentRoutineIndex !== null) {
            db.routines[currentRoutineIndex] = {
                name,
                exercises: images.length ? images.join(',') : db.routines[currentRoutineIndex].exercises,
                progress,
                createdAt: db.routines[currentRoutineIndex].createdAt
            };
            showToast("Routine updated!");
            currentRoutineIndex = null;
        } else {
            db.routines.push({
                name,
                exercises: images.join(','),
                progress,
                createdAt: new Date()
            });
            showToast("Routine added!");
        }
        saveAndUpdate();
        closeModal('routineModal');
        // clear form fields
        document.getElementById('routineName').value = '';
        document.getElementById('routineExercises').value = '';
        document.getElementById('routineProgress').value = '';
    };

    if (files.length === 0) return processRoutine();

    let loaded = 0;
    for (let i = 0; i < files.length; i++) {
        const reader = new FileReader();
        reader.onload = (e) => {
            images[i] = e.target.result; // keep correct order
            loaded++;
            if (loaded === files.length) processRoutine(); // call only once
        };
        reader.readAsDataURL(files[i]);
    }
}


function editRoutine(index) {
    currentRoutineIndex = index;
    const r = db.routines[index];
    document.getElementById('routineName').value = r.name;
    document.getElementById('routineProgress').value = r.progress;
    document.getElementById('routineExercises').value = '';
    openModal('routineModal');
}

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
    await loadUsersFromServer(); // fetch users from server
    updateTables();
};
