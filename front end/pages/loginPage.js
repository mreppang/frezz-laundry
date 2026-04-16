import { createButton, createInfoBox } from "../components/ui.js";
import { getApiBaseUrl, setApiBaseUrl } from "../services/auth.js";
import { login } from "../services/api.js";

export async function renderLoginPage(root, { onLoginSuccess }) {
  root.innerHTML = "";

  const shell = document.createElement("div");
  shell.className = "login-shell";

  const layout = document.createElement("div");
  layout.className = "login-layout";

  const hero = document.createElement("section");
  hero.className = "login-hero";
  hero.innerHTML = `
    <span class="hero-pill">Aplikasi Kasir Laundry</span>
    <h1 class="hero-title">Operasional laundry lebih cepat, rapi, dan profesional.</h1>
    <p class="hero-copy">
      Kelola order, pantau status cucian, hitung total otomatis, dan akses laporan harian
      dalam satu dashboard yang ringan dan mudah dipakai kasir.
    </p>
    <div class="hero-grid">
      <div class="hero-card">
        <strong>Kasir lebih fokus</strong>
        <span>Transaksi kiloan dan satuan ada dalam satu alur input yang simpel.</span>
      </div>
      <div class="hero-card">
        <strong>Owner lebih tenang</strong>
        <span>Pendapatan dan master data bisa dipantau langsung dari dashboard.</span>
      </div>
    </div>
  `;

  const card = document.createElement("section");
  card.className = "login-card";
  card.innerHTML = `
    <div>
      <p class="helper-text" style="color: var(--primary-dark); margin: 0;">Masuk ke sistem</p>
      <h2 class="page-title" style="font-size: 1.7rem; margin-top: 8px;">Login Kasir</h2>
      <p class="page-subtitle">Masukkan akun yang terdaftar untuk melanjutkan.</p>
    </div>
  `;

  const messageBox = document.createElement("div");
  const form = document.createElement("form");
  form.className = "form-grid";
  form.innerHTML = `
    <div class="field">
      <label for="api-base-url">API Base URL</label>
      <input class="input" id="api-base-url" name="apiBaseUrl" value="${getApiBaseUrl()}" placeholder="http://localhost:3000" />
    </div>
    <div class="field">
      <label for="username">Username</label>
      <input class="input" id="username" name="username" placeholder="Masukkan username" required />
    </div>
    <div class="field">
      <label for="password">Password</label>
      <input class="input" id="password" name="password" type="password" placeholder="Masukkan password" required />
    </div>
  `;

  const submitButton = createButton("Masuk", "btn btn-primary", null, "submit");
  submitButton.style.width = "100%";
  form.appendChild(submitButton);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    messageBox.replaceChildren();

    const formData = new FormData(form);
    const apiBaseUrl = String(formData.get("apiBaseUrl") || "").trim();
    const username = String(formData.get("username") || "").trim();
    const password = String(formData.get("password") || "").trim();

    if (!apiBaseUrl || !username || !password) {
      messageBox.appendChild(createInfoBox("API Base URL, username, dan password wajib diisi.", "error"));
      return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Memproses...";
    setApiBaseUrl(apiBaseUrl);

    try {
      await login({ username, password });
      onLoginSuccess();
    } catch (error) {
      messageBox.appendChild(createInfoBox(error.message, "error"));
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Masuk";
    }
  });

  card.append(messageBox, form);
  layout.append(hero, card);
  shell.appendChild(layout);
  root.appendChild(shell);
}
