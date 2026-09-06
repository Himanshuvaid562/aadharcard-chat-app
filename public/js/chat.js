// Connect with JWT token
const socket = io("http://localhost:5000", {
    auth: {
        token: localStorage.getItem("token")
    }
});

const usersDiv = document.getElementById("users");
const messagesDiv = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");

let selectedUserId = null;

// Redirect if not logged in
if (!localStorage.getItem("token")) {
    window.location.href = "login.html";
}

// Get userId from JWT
function getUserIdFromToken() {
    const token = localStorage.getItem("token");
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.id;
}

// Load users into sidebar
async function loadUsers() {
    const res = await fetch("/api/users", {
        headers: {
            "Authorization": localStorage.getItem("token")
        }
    });

    const users = await res.json();
    usersDiv.innerHTML = "";

    users.forEach(user => {
        const div = document.createElement("div");
        div.innerText = user.name;
        div.style.padding = "10px";
        div.style.cursor = "pointer";

        div.onclick = () => selectUser(user._id, user.name);

        usersDiv.appendChild(div);
    });
}

// When user is clicked
function selectUser(userId, name) {
    selectedUserId = userId;
    document.querySelector(".chat-header").innerText = name;
    messagesDiv.innerHTML = "";
    loadMessages(userId);
}

// Load previous messages
async function loadMessages(receiverId) {
    const res = await fetch(`/api/messages/${receiverId}`, {
        headers: {
            "Authorization": localStorage.getItem("token")
        }
    });

    const messages = await res.json();
    messages.forEach(displayMessage);
}

// Send message
function sendMessage() {
    const text = messageInput.value.trim();
    if (!text || !selectedUserId) return;

    socket.emit("sendMessage", {
        receiverId: selectedUserId,
        text
    });

    messageInput.value = "";
}

// Receive message
socket.on("receiveMessage", (message) => {
    displayMessage(message);
});

// Display message
function displayMessage(message) {
    const div = document.createElement("div");
    div.classList.add("message");

    if (message.sender === getUserIdFromToken()) {
        div.classList.add("sent");
    } else {
        div.classList.add("received");
    }

    div.innerText = message.text;
    messagesDiv.appendChild(div);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Initial load
loadUsers();