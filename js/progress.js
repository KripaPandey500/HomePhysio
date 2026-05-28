/**
 * progress.js — Progress tracking page
 */

const API = 'http://localhost:5000';

document.addEventListener('DOMContentLoaded', async () => {
    await checkSession();
    await loadProgress();
});

async function checkSession() {
    const res  = await fetch(`${API}/check-session`, { credentials: 'include' });
    const data = await res.json();
    if (!data.loggedIn) { window.location.href = 'login.html'; }

    const el = document.getElementById('userGreeting');
    if (el) el.textContent = `Hi, ${data.user?.name || ''}!`;
}

async function loadProgress() {
    try {
        const res  = await fetch(`${API}/progress`, { credentials: 'include' });
        const logs = await res.json();
        renderProgress(logs);
        renderCalendar(logs);
        renderStats(logs);
    } catch {
        showErrorMsg('Could not load progress. Make sure the server is running.');
    }
}

// ── Stats summary ─────────────────────────────────────────
function renderStats(logs) {
    const totalWorkouts  = logs.length;
    const totalExercises = logs.reduce((s, l) => s + (l.exercises || 0), 0);
    const totalMinutes   = Math.round(logs.reduce((s, l) => s + (l.duration || 0), 0) / 60);

    // Streak: consecutive days up to today
    const today    = new Date(); today.setHours(0,0,0,0);
    const daySet   = new Set(logs.map(l => {
        const d = new Date(l.completedAt); d.setHours(0,0,0,0);
        return d.getTime();
    }));
    let streak = 0, check = today.getTime();
    while (daySet.has(check)) { streak++; check -= 86400000; }

    const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setEl('statWorkouts',  totalWorkouts);
    setEl('statExercises', totalExercises);
    setEl('statMinutes',   totalMinutes);
    setEl('statStreak',    streak);
}

// ── Progress log list ─────────────────────────────────────
function renderProgress(logs) {
    const container = document.getElementById('progressList');
    if (!container) return;

    if (!logs.length) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-chart-bar" style="font-size:3rem;color:#ccc"></i>
                <h3>No workouts yet!</h3>
                <p>Complete a routine and your progress will show up here.</p>
                <a href="routines.html" class="btn-primary">Start a Routine</a>
            </div>`;
        return;
    }

    container.innerHTML = logs.map(log => {
        const date = new Date(log.completedAt);
        const mins = Math.floor((log.duration || 0) / 60);
        const secs = (log.duration || 0) % 60;
        return `
            <div class="progress-card">
                <div class="progress-card-icon"><i class="fas fa-check-circle"></i></div>
                <div class="progress-card-info">
                    <strong>${log.routineName || 'Unnamed Routine'}</strong>
                    <span>${date.toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' })} · ${date.toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' })}</span>
                </div>
                <div class="progress-card-meta">
                    <span><i class="fas fa-dumbbell"></i> ${log.exercises || 0} exercises</span>
                    <span><i class="fas fa-clock"></i> ${mins}m ${String(secs).padStart(2,'0')}s</span>
                </div>
            </div>
        `;
    }).join('');
}

// ── Calendar heatmap ──────────────────────────────────────
function renderCalendar(logs) {
    const container = document.getElementById('calendarGrid');
    if (!container) return;

    // Map date → count
    const counts = {};
    logs.forEach(l => {
        const d = new Date(l.completedAt);
        const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        counts[key] = (counts[key] || 0) + 1;
    });

    // Show last 35 days (5 weeks)
    const today = new Date();
    const cells = [];
    for (let i = 34; i >= 0; i--) {
        const d   = new Date(today);
        d.setDate(today.getDate() - i);
        d.setHours(0,0,0,0);
        const key   = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        const count = counts[key] || 0;
        const level = count === 0 ? 0 : count === 1 ? 1 : count <= 2 ? 2 : 3;
        cells.push(`<div class="cal-cell level-${level}" title="${d.toDateString()}: ${count} workout(s)"></div>`);
    }

    const label = document.getElementById('calendarLabel');
    if (label) label.textContent = `Last 5 weeks (${today.toLocaleDateString('en-US',{month:'short',year:'numeric'})})`;

    container.innerHTML = cells.join('');
}

function showErrorMsg(msg) {
    const container = document.getElementById('progressList');
    if (container) container.innerHTML = `<p style="color:red;text-align:center">${msg}</p>`;
}
