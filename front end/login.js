const API_LOGIN_URL = "http://localhost:3000/api/login";

function setMessage(message, type = "error") {
  const box = document.getElementById("messageBox");
  box.innerHTML = "";
  if (!message) return;

  const div = document.createElement("div");
  div.className = type === "error" ? "notice notice-error" : "notice notice-success";
  div.textContent = message;
  box.appendChild(div);
}

function setLoading(isLoading) {
  const button = document.getElementById("loginButton");
  button.disabled = isLoading;
  button.textContent = isLoading ? "Memproses..." : "Login";
}

async function submitLogin(event) {
  event.preventDefault();
  setMessage("");
  setLoading(true);

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    const response = await fetch(API_LOGIN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    console.log(data);

    if (!response.ok) {
      throw new Error(data.message || "Login gagal.");
    }

    const token = data.data.token;
    const savedUsername = data.data.user.username;
    const role = data.data.user.role;

    if (!token) {
      throw new Error("Token JWT tidak ditemukan di respons login.");
    }

    localStorage.setItem("token", token);
    localStorage.setItem("username", savedUsername);
    localStorage.setItem("role", role);

    window.location.href = "./dashboard.html";
  } catch (error) {
    setMessage(error.message || "Terjadi kesalahan saat login.");
  } finally {
    setLoading(false);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("token")) {
    window.location.href = "./dashboard.html";
    return;
  }

  document.getElementById("loginForm").addEventListener("submit", submitLogin);
});
