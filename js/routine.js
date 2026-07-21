/**
 * routine.js — Routine creation and management (routines.html)
 */

const API = '/'

let currentUser = null;
let allRoutines = [];
let allExercises = [];

// ── Init ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
    await checkSession();
    await loadExercises();
    await loadRoutines();
    bindEvents();
    renderFilterButtons();
});

async function checkSession() {
    const res = await fetch(`${API}/check-session`, { credentials: 'include' });
    const data = await res.json();
    if (!data.loggedIn) { window.location.href = 'login.html'; return; }
    currentUser = data.user;

    const el = document.getElementById('userGreeting');
    if (el) el.textContent = `Hi, ${currentUser.name}!`;
}

// ── Load Exercises ────────────────────────────────────────
async function loadExercises() {
    try {
        const res = await fetch(`${API}/api/exercises`);
        allExercises = await res.json();
    } catch {
        allExercises = [];
    }
}

// ── Load Routines ─────────────────────────────────────────
async function loadRoutines() {
    try {
        const res = await fetch(`${API}/routines`, { credentials: 'include' });
        allRoutines = await res.json();
        renderRoutineList(allRoutines);
    } catch {
        showToast('Could not load routines.', 'error');
    }
}

// ── Render My Routines ─────────────────────────────────────
function renderRoutineList(routines) {
    const grid  = document.getElementById('routineGrid');
    const empty = document.getElementById('emptyMessage');
    if (!grid) return;

    grid.innerHTML = '';

    if (!routines.length) {
        if (empty) empty.style.display = 'block';
        return;
    }
    if (empty) empty.style.display = 'none';

    routines.forEach(r => {
        const card = document.createElement('div');
        card.className = 'routine-item';
        card.innerHTML = `
            <div class="routine-header">
                <span class="routine-name">${r.name}</span>
                <span class="routine-meta">${r.exercises.length} exercise(s) · ${r.cycles || 1} cycle(s)</span>
            </div>
            <div class="routine-actions">
                <button class="btn-primary" onclick="startPlayback('${r._id}')">
                    <i class="fas fa-play"></i> Start
                </button>
                <button class="btn-outline" onclick="openAddExerciseModal('${r._id}')">
                    <i class="fas fa-plus"></i> Add Exercise
                </button>
                <button class="btn-outline" onclick="viewRoutine('${r._id}')">
                    <i class="fas fa-eye"></i> View
                </button>
                <button class="btn-danger" onclick="deleteRoutine('${r._id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        grid.appendChild(card);
    });
}

// ── Build Routine (exercise picker) ───────────────────────
let selectedExercises = [];
let filterCategory    = 'All';

function renderFilterButtons() {
    const container = document.getElementById('filterBtns');
    if (!container) return;

    const categories = ['All', ...new Set(allExercises.map(e => e.category || e.bodyPart || 'General'))];
    container.innerHTML = '';
    categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.textContent = cat;
        btn.className = cat === filterCategory ? 'filter-btn active' : 'filter-btn';
        btn.onclick = () => {
            filterCategory = cat;
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderExercisePicker();
        };
        container.appendChild(btn);
    });
    renderExercisePicker();
}

function renderExercisePicker() {
    const grid = document.getElementById('exercisePickerGrid');
    if (!grid) return;

    const filtered = filterCategory === 'All'
        ? allExercises
        : allExercises.filter(e => (e.category || e.bodyPart || 'General') === filterCategory);

    grid.innerHTML = '';
    filtered.forEach(ex => {
        const inList = selectedExercises.some(s => s._id === ex._id);
        const card = document.createElement('div');
        card.className = `exercise-picker-card ${inList ? 'selected' : ''}`;
        card.innerHTML = `
            <img src="${ex.image || 'assets/images/rehab.png'}" alt="${ex.name}" onerror="this.src='assets/images/rehab.png'">
            <div class="pick-info">
                <strong>${ex.name}</strong>
                <span>${ex.sets} sets × ${ex.reps} reps · <span class="badge badge-${(ex.difficulty||'Easy').toLowerCase()}">${ex.difficulty}</span></span>
            </div>
            <button class="pick-btn" onclick="toggleExerciseSelect(this, ${JSON.stringify(ex).replace(/"/g,'&quot;')})">
                ${inList ? '<i class="fas fa-check"></i> Added' : '<i class="fas fa-plus"></i> Select'}
            </button>
        `;
        grid.appendChild(card);
    });
}

function toggleExerciseSelect(btn, ex) {
    const idx = selectedExercises.findIndex(s => s._id === ex._id);
    if (idx === -1) {
        selectedExercises.push(ex);
    } else {
        selectedExercises.splice(idx, 1);
    }
    updateSelectedCount();
    renderExercisePicker();
}

function updateSelectedCount() {
    const el = document.getElementById('selectedCount');
    if (el) el.textContent = `${selectedExercises.length} selected`;
}

// ── Create Routine ────────────────────────────────────────
async function createRoutine() {
    const nameInput   = document.getElementById('routineName');
    const cyclesInput = document.getElementById('routineCycles');
    const name        = nameInput?.value.trim();
    const cycles      = parseInt(cyclesInput?.value) || 1;

    if (!name) { showToast('Please enter a routine name.', 'error'); return; }
    if (!selectedExercises.length) { showToast('Please select at least one exercise.', 'error'); return; }

    try {
        // 1. Create the routine
        const res1 = await fetch(`${API}/routines`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ name, cycles })
        });
        const d1 = await res1.json();
        if (!res1.ok) { showToast(d1.msg || 'Failed to create', 'error'); return; }

        const routineId = d1.routine._id;

        // 2. Add each exercise
        for (const ex of selectedExercises) {
            await fetch(`${API}/routines/${routineId}/exercises`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ exercise: ex })
            });
        }

        showToast(`Routine "${name}" created with ${selectedExercises.length} exercise(s)!`);
        selectedExercises = [];
        updateSelectedCount();
        if (nameInput)   nameInput.value   = '';
        if (cyclesInput) cyclesInput.value = '1';

        // Switch to My Routines tab
        await loadRoutines();
        switchTab('myRoutines');

    } catch {
        showToast('Error creating routine.', 'error');
    }
}

// ── Delete Routine ────────────────────────────────────────
async function deleteRoutine(id) {
    if (!confirm('Delete this routine?')) return;
    try {
        await fetch(`${API}/routines/${id}`, { method: 'DELETE', credentials: 'include' });
        showToast('Routine deleted.');
        await loadRoutines();
    } catch {
        showToast('Could not delete.', 'error');
    }
}

// ── View Routine Detail ───────────────────────────────────
async function viewRoutine(id) {
    const routine = allRoutines.find(r => r._id === id);
    if (!routine) return;

    const modal = document.getElementById('viewRoutineModal');
    const body  = document.getElementById('viewRoutineBody');
    if (!modal || !body) return;

    body.innerHTML = `
        <h2>${routine.name}</h2>
        <p style="color:#666">${routine.exercises.length} exercise(s) · ${routine.cycles||1} cycle(s)</p>
        <div class="routine-exercise-list">
            ${routine.exercises.map((ex, i) => `
                <div class="routine-exercise-row">
                    <span class="ex-num">${i+1}</span>
                    <img src="${ex.image||'assets/images/rehab.png'}" onerror="this.src='assets/images/rehab.png'">
                    <div>
                        <strong>${ex.name}</strong>
                        <span>${ex.sets} sets × ${ex.reps} reps</span>
                    </div>
                    <button class="btn-danger sm" onclick="removeExerciseFromRoutine('${id}','${ex.exerciseId}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `).join('')}
        </div>
        <div style="margin-top:1.5rem;display:flex;gap:1rem;justify-content:center">
            <button class="btn-primary" onclick="startPlayback('${routine._id}');closeModal('viewRoutineModal')">
                <i class="fas fa-play"></i> Start Routine
            </button>
            <button class="btn-outline" onclick="closeModal('viewRoutineModal')">Close</button>
        </div>
    `;
    modal.style.display = 'flex';
}

async function removeExerciseFromRoutine(routineId, exerciseId) {
    try {
        await fetch(`${API}/routines/${routineId}/exercises/${exerciseId}`, {
            method: 'DELETE', credentials: 'include'
        });
        showToast('Exercise removed.');
        await loadRoutines();
        closeModal('viewRoutineModal');
    } catch {
        showToast('Error removing.', 'error');
    }
}

// ── Add Exercise to Existing Routine Modal ─────────────────
let targetRoutineId = null;

async function openAddExerciseModal(routineId) {
    targetRoutineId = routineId;
    const modal = document.getElementById('addExerciseModal');
    const list  = document.getElementById('addExerciseList');
    if (!modal || !list) return;

    const routine = allRoutines.find(r => r._id === routineId);
    const existingIds = (routine?.exercises || []).map(e => e.exerciseId);

    list.innerHTML = allExercises.map(ex => `
        <div class="pick-row ${existingIds.includes(ex._id) ? 'already-added' : ''}">
            <img src="${ex.image||'assets/images/rehab.png'}" onerror="this.src='assets/images/rehab.png'" style="width:50px;height:50px;object-fit:cover;border-radius:8px">
            <div style="flex:1;padding:0 1rem">
                <strong>${ex.name}</strong>
                <span style="display:block;font-size:0.8rem;color:#666">${ex.sets}×${ex.reps} · ${ex.difficulty}</span>
            </div>
            ${existingIds.includes(ex._id)
                ? '<span style="color:#aaa;font-size:0.8rem">Already added</span>'
                : `<button class="btn-primary sm" onclick="addExToRoutine(${JSON.stringify(ex).replace(/"/g,'&quot;')})">Add</button>`
            }
        </div>
    `).join('');

    modal.style.display = 'flex';
}

async function addExToRoutine(ex) {
    try {
        const res = await fetch(`${API}/routines/${targetRoutineId}/exercises`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ exercise: ex })
        });
        const d = await res.json();
        if (!res.ok) { showToast(d.msg, 'error'); return; }
        showToast(`${ex.name} added!`);
        await loadRoutines();
        openAddExerciseModal(targetRoutineId); // refresh modal
    } catch {
        showToast('Error adding exercise.', 'error');
    }
}

// ── Playback redirect ─────────────────────────────────────
function startPlayback(routineId) {
    window.location.href = `playback.html?routineId=${routineId}`;
}

// ── Tab switching ─────────────────────────────────────────
function switchTab(tab) {
    const mySection    = document.getElementById('myRoutinesSection');
    const buildSection = document.getElementById('buildRoutineSection');
    const myBtn        = document.getElementById('myRoutineBtn');
    const buildBtn     = document.getElementById('buildRoutineBtn');

    if (tab === 'myRoutines') {
        if (mySection)    mySection.style.display    = 'block';
        if (buildSection) buildSection.style.display = 'none';
        if (myBtn)        myBtn.classList.add('active');
        if (buildBtn)     buildBtn.classList.remove('active');
    } else {
        if (mySection)    mySection.style.display    = 'none';
        if (buildSection) buildSection.style.display = 'block';
        if (buildBtn)     buildBtn.classList.add('active');
        if (myBtn)        myBtn.classList.remove('active');
        renderExercisePicker();
        renderFilterButtons();
    }
}

// ── Bind Events ───────────────────────────────────────────
function bindEvents() {
    document.getElementById('myRoutineBtn')?.addEventListener('click', () => switchTab('myRoutines'));
    document.getElementById('buildRoutineBtn')?.addEventListener('click', () => switchTab('build'));
    document.getElementById('createRoutineBtn')?.addEventListener('click', createRoutine);
    switchTab('myRoutines');
}

// ── Modal ─────────────────────────────────────────────────
function closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
}

// ── Toast ─────────────────────────────────────────────────
function showToast(msg, type = 'success') {
    let t = document.getElementById('toast');
    if (!t) {
        t = document.createElement('div');
        t.id = 'toast';
        document.body.appendChild(t);
    }
    t.textContent   = msg;
    t.className     = `toast show ${type}`;
    setTimeout(() => { t.className = 'toast'; }, 3000);
}
