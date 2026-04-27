const API_LOGIN_URL = "http://localhost:3000/api/login";

function setMessage(message, type = "error") {
  const box = document.getElementById("messageBox");
  box.innerHTML = "";
  if (!message) return;

  const div = document.createElement("div");
  div.className = `message message-${type === "error" ? "error" : "success"}`;
  div.textContent = message;
  box.appendChild(div);
}

function setLoading(isLoading) {
  const button = document.getElementById("loginButton");
  const buttonText = button.querySelector(".button-text");
  const buttonSpinner = button.querySelector(".button-spinner");
  
  button.disabled = isLoading;
  
  if (isLoading) {
    buttonText.style.display = "none";
    buttonSpinner.style.display = "flex";
  } else {
    buttonText.style.display = "inline";
    buttonSpinner.style.display = "none";
  }
}

function togglePassword() {
  const passwordInput = document.getElementById("password");
  const toggleIcon = document.querySelector(".toggle-icon");
  
  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    toggleIcon.textContent = "🙈";
  } else {
    passwordInput.type = "password";
    toggleIcon.textContent = "👁️";
  }
}

function showToast(message, type = "success") {
  // Remove existing toast if any
  const existingToast = document.querySelector(".toast");
  if (existingToast) {
    existingToast.remove();
  }

  // Create toast container if it doesn't exist
  let toastContainer = document.querySelector(".toast-container");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.className = "toast-container";
    document.body.appendChild(toastContainer);
  }

  // Create toast element
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  
  const icon = type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️";
  
  toast.innerHTML = `
    <div class="toast-icon">${icon}</div>
    <div class="toast-content">
      <div class="toast-title">${type === "success" ? "Berhasil" : "Error"}</div>
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close" onclick="this.parentElement.remove()">×</button>
  `;

  toastContainer.appendChild(toast);

  // Auto remove after 5 seconds
  setTimeout(() => {
    if (toast.parentElement) {
      toast.style.animation = "slideOut 0.3s ease forwards";
      setTimeout(() => toast.remove(), 300);
    }
  }, 5000);
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
    showToast(error.message || "Terjadi kesalahan saat login.", "error");
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
  document.getElementById("passwordToggle").addEventListener("click", togglePassword);
  
  // Add input focus effects
  const inputs = document.querySelectorAll('.login-input');
  inputs.forEach(input => {
    input.addEventListener('focus', () => {
      const icon = input.parentElement.querySelector('.input-icon');
      if (icon) icon.style.color = '#27C7F7';
    });
    
    input.addEventListener('blur', () => {
      const icon = input.parentElement.querySelector('.input-icon');
      if (icon) icon.style.color = '#7C7C7C';
    });
  });
});
