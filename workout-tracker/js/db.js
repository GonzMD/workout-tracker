import { db } from './firebase-config.js';
import { collection, addDoc, query, where, getDocs, orderBy, limit, Timestamp, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const COLLECTION_USERS = 'users';
const SUBCOLLECTION_WORKOUTS = 'workouts';

// Log a set (Group by Day + Exercise + Weight)
export async function logSet(userId, exercise, day, weight, reps, rir) {
    try {
        const userRef = collection(db, COLLECTION_USERS, userId, SUBCOLLECTION_WORKOUTS);

        // Define "Today" range
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Query for existing document for this exercise & weight specific to today
        // Note: Firestore doesn't support multiple range filters on different fields easily without composite indexes.
        // We will simple query by exercise and manual filter/sort or just add a 'dateString' field for easier querying.
        // For compliance with requested structure { date: Timestamp }, we can use startAt/endAt if we index.
        // EASIER STRATEGY: add a 'dateStr' field "YYYY-MM-DD" to the document for easy grouping query.

        const dateStr = today.toISOString().split('T')[0];

        const q = query(
            userRef,
            where("exercise", "==", exercise),
            where("weight", "==", weight),
            where("dateStr", "==", dateStr) // Auxiliary field for grouping
        );

        const querySnapshot = await getDocs(q);

        const volume = weight * reps;
        const setMap = { reps, rir };

        if (!querySnapshot.empty) {
            // Update existing
            const docSnap = querySnapshot.docs[0];
            const docRef = docSnap.ref;
            const currentTotal = docSnap.data().totalVolume || 0;

            await updateDoc(docRef, {
                sets: arrayUnion(setMap),
                totalVolume: currentTotal + volume
            });
            return docRef.id;
        } else {
            // Create new
            const dataToSave = {
                day,
                exercise,
                date: Timestamp.now(),
                dateStr, // Helper
                weight,
                sets: [setMap],
                totalVolume: volume
            };
            const docRef = await addDoc(userRef, dataToSave);
            return docRef.id;
        }
    } catch (e) {
        console.error("Error logging set: ", e);
        throw e;
    }
}

export async function getTodayLogs(userId) {
    try {
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0];
        const userRef = collection(db, COLLECTION_USERS, userId, SUBCOLLECTION_WORKOUTS);
        // We can use the dateStr helper
        const q = query(userRef, where("dateStr", "==", dateStr), orderBy("date", "desc"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error getting today logs:", error);
        return [];
    }
}

// Get workouts for a specific day tag (e.g., "Día 1") OR specific date if needed
// For this app, the requirement implies showing history. 
// "Mostrar ejercicios correspondientes" might mean pre-defined routine? 
// The prompt says "Selector de Día -> Mostrar ejercicios correspondientes". 
// This suggests a static configuration of routines OR fetching from DB.
// Let's assume there's a local configuration for the routine structure, 
// and we fetch *logs* from DB.

// Get last weight/setup for a specific exercise
export async function getLastLog(userId, exerciseName) {
    try {
        const workoutsRef = collection(db, COLLECTION_USERS, userId, SUBCOLLECTION_WORKOUTS);
        const q = query(
            workoutsRef,
            where("exercise", "==", exerciseName),
            orderBy("date", "desc"),
            limit(1)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            return querySnapshot.docs[0].data();
        }
        return null;
    } catch (error) {
        console.error("Error getting last log:", error);
        return null;
    }
}

// Get history for an exercise (for charts/list)
export async function getExerciseHistory(userId, exerciseName) {
    try {
        const workoutsRef = collection(db, COLLECTION_USERS, userId, SUBCOLLECTION_WORKOUTS);
        const q = query(
            workoutsRef,
            where("exercise", "==", exerciseName),
            orderBy("date", "desc"),
            limit(20) // Limit to last 20 sessions for performance
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error getting history:", error);
        return [];
    }
}

// Get all logs for CSV export
export async function getAllLogs(userId) {
    try {
        const workoutsRef = collection(db, COLLECTION_USERS, userId, SUBCOLLECTION_WORKOUTS);
        const q = query(workoutsRef, orderBy("date", "desc"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error getting all logs:", error);
        return [];
    }
}
