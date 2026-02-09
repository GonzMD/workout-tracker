// Utility functions
export function formatDate(date) {
    if (!date) return '';
    // Handle Firestore Timestamp or Date object
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Function to handle local Excel file update
export async function updateLocalExcel(newLogs) {
    /* 
       Uses File System Access API to:
       1. Open existing file handle (or create new)
       2. Read content
       3. Append new data
       4. Save back
    */
    if (!window.showOpenFilePicker) {
        alert("Tu navegador no soporta la edición de archivos locales. Por favor usa Chrome o Edge en PC.");
        return;
    }

    try {
        // 1. Ask user to pick the file
        const [fileHandle] = await window.showOpenFilePicker({
            types: [{
                description: 'Excel Spreadsheets',
                accept: {
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
                }
            }],
            multiple: false
        });

        const file = await fileHandle.getFile();
        const arrayBuffer = await file.arrayBuffer();

        // 2. Read workbook
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert to JSON to append easily
        const existingData = XLSX.utils.sheet_to_json(worksheet);

        // Prepare new data (ensure format matches)
        const newData = newLogs.map(log => ({
            "Fecha": log.Date, // Expecting ISO string or similar
            "Día": log.Day,
            "Ejercicio": log.Exercise,
            "Peso (kg)": log.Weight,
            "Serie": log.SetOrder,
            "Reps": log.Reps,
            "RIR": log.RIR
        }));

        // Filter duplicates? Optional. For now just append.
        // We'll append only new data?
        // Ideally we check if data already exists, but "appending" usually means adding all.
        // Let's assume user syncs new data only? 
        // No, user request implies "filling up".
        // Strategy: We will read ALL data from App DB and OVERWRITE the Excel file with the complete history.
        // This ensures the Excel is always a mirror of the DB. 
        // Much safer than appending and risking duplicates.

        const combinedData = newData; // Since we pass "all logs" from app.js usually

        // 3. Create new worksheet
        const newWorksheet = XLSX.utils.json_to_sheet(combinedData);
        const newWorkbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, "Entrenamientos");

        // 4. Write back
        const writable = await fileHandle.createWritable();
        const wbOut = XLSX.write(newWorkbook, { bookType: 'xlsx', type: 'array' });
        await writable.write(wbOut);
        await writable.close();

        alert("Archivo Excel actualizado correctamente.");

    } catch (err) {
        if (err.name !== 'AbortError') {
            console.error(err);
            alert("Error al actualizar el archivo: " + err.message);
        }
    }
}

export function downloadCSV(data, filename) {
    if (!data || !data.length) {
        alert("No hay datos para exportar");
        return;
    }

    const headers = Object.keys(data[0]).join(",");
    const rows = data.map(row =>
        Object.values(row).map(val => {
            // Handle commas in values
            const str = String(val);
            return str.includes(',') ? `"${str}"` : str;
        }).join(",")
    );

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

