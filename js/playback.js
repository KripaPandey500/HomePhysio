/**
 * playback.js — Routine playback page
 * Shows each exercise one by one with countdown timer, progress bar,
 * and logs completion to the backend.
 */

const API = 'http://localhost:5000';

let routine          = null;
let currentIndex     = 0;
let currentSet       = 1;
let currentCycle     = 1;
let timerInterval    = null;
let secondsLeft      = 0;
let restMode         = false;
let startTime        = null;
let paused           = false;

const REST_SECONDS   = 15;   // rest between exercises
const HOLD_SECONDS   = 30;   // default active hold / work time per set

// ── Init ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
    await checkSession();
    await loadRoutine();
});

async function checkSession() {
    const res  = await fetch(`${API}/check-session`, { credentials: 'include' });
    const data = await res.json();
    if (!data.loggedIn) { window.location.href = 'login.html'; }
}

async function loadRoutine() {
    const params    = new URLSearchParams(window.location.search);
    const routineId = params.get('routineId');

    if (!routineId) {
        showError('No routine selected. Go back and pick a routine.');
        return;
    }

    try {
        const res  = await fetch(`${API}/routines/${routineId}`, { credentials: 'include' });
        if (!res.ok) { showError('Routine not found.'); return; }
        routine   = await res.json();
        startTime = Date.now();
        renderOverview();
    } catch {
        showError('Could not load routine. Make sure the server is running.');
    }
}

// ── Overview screen ───────────────────────────────────────
function renderOverview() {
    const container = document.getElementById('playbackContainer');
    if (!container) return;

    container.innerHTML = `
        <div class="playback-overview">
            <h1><i class="fas fa-dumbbell"></i> ${routine.name}</h1>
            <p class="overview-meta">
                ${routine.exercises.length} exercises · ${routine.cycles || 1} cycle(s)
            </p>
            <ul class="overview-list">
                ${routine.exercises.map((ex, i) => `
                    <li>
                        <span class="ex-num">${i + 1}</span>
                        <img src="${ex.image || 'assets/images/rehab.png'}" onerror="this.src='assets/images/rehab.png'">
                        <div>
                            <strong>${ex.name}</strong>
                            <span>${ex.sets} sets × ${ex.reps} reps · ${ex.difficulty || 'Easy'}</span>
                        </div>
                    </li>
                `).join('')}
            </ul>
            <button class="btn-primary btn-lg" id="startBtn" onclick="beginPlayback()">
                <i class="fas fa-play"></i> Begin Workout
            </button>
            <a href="routines.html" class="btn-outline" style="margin-left:1rem">
                <i class="fas fa-arrow-left"></i> Back
            </a>
        </div>
    `;
}

// ── Begin Playback ────────────────────────────────────────
function beginPlayback() {
    currentIndex = 0;
    currentSet   = 1;
    currentCycle = 1;
    restMode     = false;
    startTime    = Date.now();
    showExercise();
}

// ── Show Current Exercise ─────────────────────────────────
function showExercise() {
    clearInterval(timerInterval);
    restMode = false;

    const ex = routine.exercises[currentIndex];
    if (!ex) { finishRoutine(); return; }

    const totalEx      = routine.exercises.length;
    const totalCycles  = routine.cycles || 1;
    const progressPct  = Math.round(((currentIndex * totalCycles + currentCycle - 1) / (totalEx * totalCycles)) * 100);

    const container = document.getElementById('playbackContainer');
    container.innerHTML = `
        <div class="playback-exercise">
            <!-- Header -->
            <div class="pb-header">
                <a href="routines.html" class="pb-back"><i class="fas fa-times"></i></a>
                <span class="pb-progress-text">Exercise ${currentIndex + 1}/${totalEx} · Cycle ${currentCycle}/${totalCycles}</span>
            </div>

            <!-- Progress bar -->
            <div class="pb-progress-bar">
                <div class="pb-progress-fill" style="width:${progressPct}%"></div>
            </div>

            <!-- Exercise image -->
            <div class="pb-image-wrap">
                <img id="exImage" src="${ex.image || 'assets/images/rehab.png'}"
                     alt="${ex.name}"
                     onerror="this.src='assets/images/rehab.png'">
            </div>

            <!-- Exercise info -->
            <div class="pb-info">
                <h2>${ex.name}</h2>
                <div class="pb-meta">
                    <span><i class="fas fa-redo"></i> Set ${currentSet} of ${ex.sets}</span>
                    <span><i class="fas fa-hashtag"></i> ${ex.reps} reps</span>
                    <span class="badge badge-${(ex.difficulty||'easy').toLowerCase()}">${ex.difficulty || 'Easy'}</span>
                </div>
                <p class="pb-description">${(ex.description || '').split('\n')[0]}</p>
            </div>

            <!-- Timer -->
            <div class="pb-timer-wrap">
                <div class="pb-timer-circle">
                    <span id="timerDisplay">${HOLD_SECONDS}</span>
                    <small>seconds</small>
                </div>
                <p class="pb-timer-label" id="timerLabel">Work time</p>
            </div>

            <!-- Controls -->
            <div class="pb-controls">
                <button class="btn-outline" onclick="prevExercise()"><i class="fas fa-step-backward"></i> Prev</button>
                <button class="btn-primary" id="pauseBtn" onclick="togglePause()"><i class="fas fa-pause"></i> Pause</button>
                <button class="btn-outline" onclick="nextSet()">Next Set <i class="fas fa-forward"></i></button>
                <button class="btn-success" onclick="skipToNext()">Skip <i class="fas fa-step-forward"></i></button>
            </div>
        </div>
    `;

    // Start the countdown timer
    startTimer(HOLD_SECONDS, onTimerEnd);
}

// ── Timer ─────────────────────────────────────────────────
function startTimer(seconds, onEnd) {
    clearInterval(timerInterval);
    secondsLeft = seconds;
    paused      = false;
    updateTimerDisplay();

    timerInterval = setInterval(() => {
        if (paused) return;
        secondsLeft--;
        updateTimerDisplay();
        if (secondsLeft <= 0) {
            clearInterval(timerInterval);
            onEnd();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const el = document.getElementById('timerDisplay');
    if (el) el.textContent = secondsLeft;
    // pulse red when <= 5
    const circle = el?.closest('.pb-timer-circle');
    if (circle) circle.classList.toggle('urgent', secondsLeft <= 5);
}

function togglePause() {
    paused = !paused;
    const btn = document.getElementById('pauseBtn');
    if (btn) btn.innerHTML = paused
        ? '<i class="fas fa-play"></i> Resume'
        : '<i class="fas fa-pause"></i> Pause';
}

function onTimerEnd() {
    const ex = routine.exercises[currentIndex];
    // If more sets left → rest, then next set
    if (currentSet < ex.sets) {
        showRest(() => { currentSet++; showExercise(); });
    } else {
        // All sets done, go to next exercise (or finish)
        showRest(() => skipToNext());
    }
}

function nextSet() {
    clearInterval(timerInterval);
    const ex = routine.exercises[currentIndex];
    if (currentSet < ex.sets) {
        showRest(() => { currentSet++; showExercise(); });
    } else {
        showRest(() => skipToNext());
    }
}

function skipToNext() {
    clearInterval(timerInterval);
    currentSet = 1;
    if (currentIndex + 1 < routine.exercises.length) {
        currentIndex++;
        showExercise();
    } else {
        // All exercises done, check cycles
        if (currentCycle < (routine.cycles || 1)) {
            currentCycle++;
            currentIndex = 0;
            showExercise();
        } else {
            finishRoutine();
        }
    }
}

function prevExercise() {
    clearInterval(timerInterval);
    currentSet = 1;
    if (currentIndex > 0) { currentIndex--; showExercise(); }
}

// ── Rest screen ───────────────────────────────────────────
function showRest(onDone) {
    restMode = true;
    const container = document.getElementById('playbackContainer');
    container.innerHTML = `
        <div class="playback-rest">
            <h2><i class="fas fa-mug-hot"></i> Rest</h2>
            <div class="pb-timer-circle large">
                <span id="timerDisplay">${REST_SECONDS}</span>
                <small>seconds</small>
            </div>
            <p>Take a breather — next up: <strong>${routine.exercises[currentIndex + 1]?.name || 'Final set'}</strong></p>
            <button class="btn-primary" onclick="skipRest()">Skip Rest <i class="fas fa-forward"></i></button>
        </div>
    `;

    window._skipRestCallback = onDone;
    startTimer(REST_SECONDS, onDone);
}

function skipRest() {
    clearInterval(timerInterval);
    if (window._skipRestCallback) window._skipRestCallback();
}

// ── Finish ─────────────────────────────────────────────────
async function finishRoutine() {
    clearInterval(timerInterval);
    const durationSec = Math.round((Date.now() - startTime) / 1000);

    // Save progress to DB
    try {
        await fetch(`${API}/progress`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                routineId:   routine._id,
                routineName: routine.name,
                duration:    durationSec,
                exercises:   routine.exercises.length,
                notes:       ''
            })
        });
    } catch { /* non-critical */ }

    const container = document.getElementById('playbackContainer');
    const mins = Math.floor(durationSec / 60);
    const secs = durationSec % 60;

    container.innerHTML = `
        <div class="playback-complete">
            <div class="complete-icon"><i class="fas fa-trophy"></i></div>
            <h1>Workout Complete!</h1>
            <p>Great job, you finished <strong>${routine.name}</strong>.</p>
            <div class="complete-stats">
                <div class="stat-box">
                    <span>${routine.exercises.length}</span>
                    <small>Exercises</small>
                </div>
                <div class="stat-box">
                    <span>${routine.cycles || 1}</span>
                    <small>Cycle(s)</small>
                </div>
                <div class="stat-box">
                    <span>${mins}:${String(secs).padStart(2,'0')}</span>
                    <small>Duration</small>
                </div>
            </div>
            <div style="margin-top:2rem;display:flex;gap:1rem;justify-content:center;flex-wrap:wrap">
                <a href="routines.html" class="btn-primary"><i class="fas fa-redo"></i> Do Another</a>
                <a href="progress.html" class="btn-outline"><i class="fas fa-chart-bar"></i> View Progress</a>
            </div>
        </div>
    `;
}

// ── Error ─────────────────────────────────────────────────
function showError(msg) {
    const container = document.getElementById('playbackContainer');
    if (container) container.innerHTML = `
        <div class="playback-error">
            <i class="fas fa-exclamation-triangle"></i>
            <p>${msg}</p>
            <a href="routines.html" class="btn-primary">Back to Routines</a>
        </div>
    `;
}
