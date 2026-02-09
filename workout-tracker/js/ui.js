import { WORKOUT_ROUTINES } from './workouts.js';
import { formatDate } from './utils.js';

let progressChart = null;

// UI Helper functions
export function showSection(sectionId) {
    document.querySelectorAll('.view').forEach(el => el.classList.add('hidden'));
    document.getElementById(sectionId).classList.remove('hidden');
}

export function updateUserInfo(user) {
    if (user) {
        document.getElementById('user-name').textContent = user.displayName || user.email;
        if (user.photoURL) {
            document.getElementById('user-avatar').src = user.photoURL;
        }
    }
}

export function populateExerciseList(day) {
    const list = document.getElementById('exercises-list');
    list.innerHTML = '';
    const exercises = WORKOUT_ROUTINES[day] || [];
    exercises.forEach(ex => {
        const option = document.createElement('option');
        option.value = ex;
        list.appendChild(option);
    });
}

export function updateStatsDisplay(lastLog, sessionVolume) {
    const lastWeightEl = document.getElementById('last-weight-display');
    const volumeEl = document.getElementById('session-volume-display');

    if (lastLog) {
        lastWeightEl.textContent = `${lastLog.weight} kg (${lastLog.sets[0].reps} reps)`;
    } else {
        lastWeightEl.textContent = '-- kg';
    }

    volumeEl.textContent = `${sessionVolume} kg`;
}

export function renderHistory(logs) {
    const list = document.getElementById('history-list');
    list.innerHTML = '';

    if (logs.length === 0) {
        list.innerHTML = '<li class="empty-state">No hay registros recientes.</li>';
        return;
    }

    logs.forEach(log => {
        const li = document.createElement('li');
        li.className = 'history-item';
        li.innerHTML = `
            <div class="history-item-details">
                <strong>${log.exercise}</strong> <br>
                ${log.weight}kg x ${log.sets[0].reps} (${log.sets[0].rir} RIR)
            </div>
            <div class="history-item-meta">
                ${formatDate(log.date)}
            </div>
        `;
        list.appendChild(li);
    });
}

export function renderProgressChart(logs, exerciseName) {
    const ctx = document.getElementById('progress-chart').getContext('2d');

    // Filter logs for this exercise and sort by date ascending
    const exerciseLogs = logs
        .filter(l => l.exercise === exerciseName)
        .sort((a, b) => a.date.seconds - b.date.seconds);

    const labels = exerciseLogs.map(l => formatDate(l.date));
    const data = exerciseLogs.map(l => l.weight);

    if (progressChart) {
        progressChart.destroy();
    }

    progressChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: `Progreso: ${exerciseName}`,
                data: data,
                borderColor: '#00E676',
                backgroundColor: 'rgba(0, 230, 118, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: false,
                    grid: { color: '#333' },
                    ticks: { color: '#B0B0B0' }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#B0B0B0' }
                }
            },
            plugins: {
                legend: { labels: { color: '#FFF' } }
            }
        }
    });
}

export function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.remove('hidden');
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

