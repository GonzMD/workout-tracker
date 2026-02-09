export async function syncToGoogleSheets(logs, accessToken) {
    if (!accessToken) {
        throw new Error("No access token available. Please re-login.");
    }

    const SPREADSHEET_TITLE = "Workout Log (App Sync)";
    const HEADERS = ["Fecha", "Día", "Ejercicio", "Peso (kg)", "Serie", "Reps", "RIR"];

    // 1. Find or create spreadsheet
    let spreadsheetId = await findSpreadsheet(accessToken, SPREADSHEET_TITLE);

    if (!spreadsheetId) {
        spreadsheetId = await createSpreadsheet(accessToken, SPREADSHEET_TITLE);
        // Add headers
        await appendRow(accessToken, spreadsheetId, [HEADERS]);
    } else {
        // Clear existing data (optional, but safer to avoid dupes if we sync *everything*)
        // For simplicity, let's just clear the sheet and rewrite all.
        await clearSheet(accessToken, spreadsheetId);
        await appendRow(accessToken, spreadsheetId, [HEADERS]);
    }

    // 2. Prepare data
    const rows = logs.map(log => [
        log.Date, // ISO string
        log.Day,
        log.Exercise,
        log.Weight,
        log.SetOrder,
        log.Reps,
        log.RIR
    ]);

    // 3. Batch Append
    // Google Sheets API has limits, but for <1000 rows batch update is fine.
    await appendRow(accessToken, spreadsheetId, rows);

    return spreadsheetId;
}

async function findSpreadsheet(token, title) {
    const response = await fetch(`https://www.googleapis.com/drive/v3/files?q=name='${title}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    const data = await response.json();
    return data.files && data.files.length > 0 ? data.files[0].id : null;
}

async function createSpreadsheet(token, title) {
    const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ properties: { title } })
    });
    const data = await response.json();
    return data.spreadsheetId;
}

async function clearSheet(token, spreadsheetId) {
    const range = 'Sheet1!A:Z'; // Assumes default sheet name is 'Sheet1' or first sheet
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:clear`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
    });
}

// Helper to append rows
async function appendRow(token, spreadsheetId, values) {
    const range = 'Sheet1!A1';
    const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ values })
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error.message);
    }
}
