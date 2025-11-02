let db;
const request = indexedDB.open("HomePhysioDB", 1);

request.onupgradeneeded = (e) => {
    db = e.target.result;

    // Users store
    if (!db.objectStoreNames.contains("users")) {
        const userStore = db.createObjectStore("users", { keyPath: "email" });
        userStore.createIndex("password", "password", { unique: false });
        userStore.createIndex("name", "name", { unique: false });
    }

    // Exercises store
    if (!db.objectStoreNames.contains("exercises")) {
        const exStore = db.createObjectStore("exercises", { keyPath: "id" });
    }

    // Routines store
    if (!db.objectStoreNames.contains("routines")) {
        const rtStore = db.createObjectStore("routines", { keyPath: "id" });
    }

    // Progress store
    if (!db.objectStoreNames.contains("progress")) {
        const prStore = db.createObjectStore("progress", { keyPath: "routineId" });
    }
};

request.onsuccess = (e) => {
    db = e.target.result;
    console.log("IndexedDB ready");
};


