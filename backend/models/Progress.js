function markExerciseDone(routineId, exerciseId) {
    const tx = db.transaction("progress", "readwrite");
    const store = tx.objectStore("progress");

    store.get(routineId).onsuccess = (e) => {
        let record = e.target.result || { routineId, completed: [] };
        if (!record.completed.includes(exerciseId)) {
            record.completed.push(exerciseId);
        }
        store.put(record);
    };
}
