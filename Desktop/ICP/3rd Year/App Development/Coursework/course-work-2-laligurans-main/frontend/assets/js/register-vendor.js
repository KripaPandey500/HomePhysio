async function registerVendor() {
    let dobValue = document.getElementById("dob").value;
    let dateOfBirth = null;
    if (dobValue) {
        const date = new Date(dobValue);
        dateOfBirth = date.toISOString();
    }
    const formData = new FormData();
    formData.append("firstName", document.getElementById("firstName").value);
    formData.append("lastName", document.getElementById("lastName").value);
    formData.append("email", document.getElementById("email").value);
    formData.append("password", document.getElementById("password").value);
    formData.append("phone", document.getElementById("phone").value);
    formData.append("address", document.getElementById("address").value);
    formData.append("gender", document.getElementById("gender").value);
    formData.append("dateOfBirth", dateOfBirth);
    const fileInput = document.getElementById("profilePicture");
    if (fileInput.files && fileInput.files[0]) {
        formData.append("profilePicture", fileInput.files[0]);
    }

    try {
        const response = await fetch("http://localhost:5033/api/auth/register-vendor", {
            method: "POST",
            body: formData
        });

        const result = await response.text();

        if (response.ok) {
            document.getElementById("message").innerText = "✅ " + result;
        } else {
            document.getElementById("message").innerText = "❌ " + result;
        }

    } catch (error) {
        document.getElementById("message").innerText = "Error: " + error.message;
    }
}
