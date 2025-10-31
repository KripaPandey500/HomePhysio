// Register user
function registerUser(name, email, password) {
    const tx = db.transaction("users", "readwrite");
    const store = tx.objectStore("users");

    const user = { name, email, password }; // simple, can add bcrypt hash if needed

    const req = store.add(user);
    req.onsuccess = () => alert("Registration successful!");
    req.onerror = () => alert("User already exists!");
}

// Login user
function loginUser(email, password) {
    const tx = db.transaction("users", "readonly");
    const store = tx.objectStore("users");

    const req = store.get(email);
    req.onsuccess = () => {
        const user = req.result;
        if (user && user.password === password) {
            sessionStorage.setItem("loggedInUser", email);
            window.location.href = "index.html"; // redirect to dashboard
        } else {
            alert("Invalid email or password!");
        }
    };
}

