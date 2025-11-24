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
    
    //admin
    // Admin store
if (!db.objectStoreNames.contains("admin")) {
    const adminStore = db.createObjectStore("admin", { keyPath: "email" });
    adminStore.createIndex("name", "name", { unique: false });
    adminStore.createIndex("pic", "pic", { unique: false });
    adminStore.createIndex("desc", "desc", { unique: false });
}

};

request.onsuccess = (e) => {
    db = e.target.result;
    console.log("IndexedDB ready");
};


