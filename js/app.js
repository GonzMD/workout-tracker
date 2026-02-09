import { onUserChange, loginWithGoogle, logout } from './auth.js';
import { showSection, updateUserInfo, populateExerciseList, updateStatsDisplay, renderHistory, renderProgressChart, showToast } from './ui.js';
import { logSet, getTodayLogs, getLastLog, getExerciseHistory, getAllLogs } from './db.js';
import { downloadCSV } from './utils.js';

let currentUser = null;

// App Logic
document.addEventListener('DOMContentLoaded', () => {

    // Auth Listener
    onUserChange(async (user) => {
        currentUser = user;
        if (user) {
            updateUserInfo(user);
            showSection('dashboard-view');

            // Initial Data Load
            const daySelect = document.getElementById('day-select');
            populateExerciseList(daySelect.value);
            await loadDashboard();
        } else {
            showSection('auth-view');
        }
    });

    // Login/Logout
    document.getElementById('google-login-btn').addEventListener('click', async () => {
        try {
            const result = await loginWithGoogle();
            // Store Google access token for Sheets API
            const { GoogleAuthProvider } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js");
            const credential = GoogleAuthProvider.credentialFromResult(result);
            if (credential && credential.accessToken) {
                sessionStorage.setItem('google_access_token', credential.accessToken);
            }
        } catch (error) {
            console.error("Login failed", error);
            showToast("Error al iniciar sesión");
        }
    });

    document.getElementById('logout-btn').addEventListener('click', () => {
        logout();
    });

    // Day Selection
    const daySelect = document.getElementById('day-select');
    daySelect.addEventListener('change', (e) => {
        populateExerciseList(e.target.value);
    });

    // Exercise Selection (Context loading)
    const exerciseInput = document.getElementById('exercise-name');
    exerciseInput.addEventListener('change', async (e) => {
        if (!currentUser) return;
        const exercise = e.target.value;
        if (exercise) {
            // Load stats for this exercise
            const lastLog = await getLastLog(currentUser.uid, exercise);
            // We can't easily calculate "session volume" for *this specific exercise* without filtering today's logs again
            // But updateStatsDisplay expects "Session Volume" which is usually global for the day or specific?
            // "Volumen Hoy" usually means total for the day. 
            // Let's pass the global session volume which we have in memory or re-fetch?
            // For simplicity, let's keep the global session volume static until refresh, 
            // or we can re-calculate it.
            // Actually, updateStatsDisplay takes (lastLog, sessionVolume).
            // We'll just fetch volume for today.
            const todayLogs = await getTodayLogs(currentUser.uid);
            const todayVolume = todayLogs.reduce((acc, log) => acc + (log.totalVolume || 0), 0);

            updateStatsDisplay(lastLog, todayVolume);

            // Update Chart
            const history = await getExerciseHistory(currentUser.uid, exercise);
            renderProgressChart(history, exercise);
        }
    });

    // Form Submission
    const form = document.getElementById('workout-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!currentUser) return;

        const day = daySelect.value;
        const exercise = exerciseInput.value;
        const weight = parseFloat(document.getElementById('weight-input').value);
        const reps = parseInt(document.getElementById('reps-input').value);
        const rir = parseInt(document.getElementById('rir-input').value);

        if (!exercise || isNaN(weight) || isNaN(reps) || isNaN(rir)) {
            showToast("Por favor completa todos los campos");
            return;
        }

        try {
            await logSet(currentUser.uid, exercise, day, weight, reps, rir);
            showToast("Serie registrada");
            await loadDashboard(); // Refresh history and volume

            // Refresh Chart if it's the same exercise
            const history = await getExerciseHistory(currentUser.uid, exercise);
            renderProgressChart(history, exercise);

        } catch (error) {
            console.error("Error logging set:", error);
            showToast("Error al guardar");
        }
    });

    // Export CSV
    document.getElementById('export-btn').addEventListener('click', async () => {
        if (!currentUser) return;
        const logs = await getAllLogs(currentUser.uid);
        // Flatten logs for CSV (since sets are an array)
        const flatLogs = logs.flatMap(log => {
            return log.sets.map((set, index) => ({
                Date: log.date.toDate().toISOString(),
                Day: log.day,
                Exercise: log.exercise,
                Weight: log.weight,
                SetOrder: index + 1,
                Reps: set.reps,
                RIR: set.rir
            }));
        });
        downloadCSV(flatLogs, `workout_history_${new Date().toISOString().split('T')[0]}.csv`);
    });

    // Sync to Google Sheets
    document.getElementById('update-excel-btn').addEventListener('click', async () => {
        if (!currentUser) {
            showToast("Debes iniciar sesión primero");
            return;
        }

        // Get Token via Firebase Auth (Force refresh to ensure we have scopes)
        // Note: Firebase JS SDK handles token refresh automatically, but we need the GOOGLE access token, 
        // which comes from the credential on sign-in result OR we can try to get it if we stored it?
        // Actually, getting the OAuth access token for Google APIs *after* initial sign-in is tricky with just client SDK 
        // if we didn't save it. 
        // The `getAuth()` user object has `accessToken` but that is for Firebase, not Google APIs.
        // We need the OAuth credential.
        // If we are already logged in, we might need to re-authenticate to get a fresh Google Access Token 
        // or use the stored one if we saved it in session/local storage.
        // Let's try re-authenticating silently or via popup if needed to get the provider token.

        let googleToken = sessionStorage.getItem('google_access_token');

        if (!googleToken) {
            // Re-auth to get a token
            try {
                // We use signInWithPopup again - if user is already logged in to Google in browser, it might be fast.
                // Better UX: Prompt user "Connect to Google Drive" separately? 
                // Let's try to get it from the current session or ask user to re-login if missing.
                const { GoogleAuthProvider, signInWithPopup } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js");
                const { auth } = await import('./firebase-config.js');
                const provider = new GoogleAuthProvider();
                provider.addScope('https://www.googleapis.com/auth/spreadsheets');
                provider.addScope('https://www.googleapis.com/auth/drive.file'); // For finding file

                const result = await signInWithPopup(auth, provider);
                const credential = GoogleAuthProvider.credentialFromResult(result);
                if (credential) {
                    googleToken = credential.accessToken;
                    sessionStorage.setItem('google_access_token', googleToken);
                }
            } catch (e) {
                console.error(e);
                showToast("Error de autenticación: " + e.message);
                return;
            }
        }

        showToast("Sincronizando con Google Sheets...");

        try {
            // Get ALL logs
            const logs = await getAllLogs(currentUser.uid);
            if (logs.length === 0) {
                showToast("No hay datos para sincronizar");
                return;
            }

            // Flatten logs
            const flatLogs = logs.flatMap(log => {
                return log.sets.map((set, index) => ({
                    Date: log.date.toDate().toISOString(),
                    Day: log.day,
                    Exercise: log.exercise,
                    Weight: log.weight,
                    SetOrder: index + 1,
                    Reps: set.reps,
                    RIR: set.rir
                }));
            });

            // Perform Sync
            const { syncToGoogleSheets } = await import('./sheets.js'); // Assuming new file created
            if (!googleToken) throw new Error("No se pudo obtener el token de acceso");

            await syncToGoogleSheets(flatLogs, googleToken);

            showToast("✅ Sincronizado exitosamente");
            // Optional: window.open('https://docs.google.com/spreadsheets', '_blank');

        } catch (error) {
            console.error("Sync Error:", error);
            showToast("Error: " + error.message);
            if (error.message.includes('401') || error.message.includes('token')) {
                sessionStorage.removeItem('google_access_token');
            }
        }
    });
});

async function loadDashboard() {
    if (!currentUser) return;
    const logs = await getTodayLogs(currentUser.uid);
    renderHistory(logs);

    // Calculate Total Volume for Today
    const totalVolume = logs.reduce((acc, log) => acc + (log.totalVolume || 0), 0);
    // We might want to update the stats display, but updateStatsDisplay is tied to specific exercise context.
    // However, the "Volumen Hoy" field in UI seems global? 
    // "Mostar último peso usado" AND "Calcular volumen total por sesión".
    // "Volumen Hoy" is in the stats row. 
    // If no exercise selected, we can just show global volume.
    // Let's update it.
    const volumeEl = document.getElementById('session-volume-display');
    if (volumeEl) volumeEl.textContent = `${totalVolume} kg`;
}

