document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const aadhaar = document.getElementById("aadhaar").value;
    const password = document.getElementById("password").value;

    const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aadhaar, password })
    });

    const data = await res.json();

    if (res.ok) {
        localStorage.setItem("token", data.token);
        window.location.href = "chat.html";
    } else {
        alert(data.message);
    }
});