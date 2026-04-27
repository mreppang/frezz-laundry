export const API_BASE_URL = "http://localhost:3000";

const menuItems = [
  { key: "dashboard", label: "Dashboard", href: "./dashboard.html", roles: ["owner", "kasir"], icon: "📊" },
  { key: "transaksi-baru", label: "Transaksi Baru", href: "./transaksi-baru.html", roles: ["owner", "kasir"], icon: "➕" },
  { key: "daftar-cucian", label: "Daftar Cucian", href: "./daftar-cucian.html", roles: ["owner", "kasir"], icon: "👕" },
  { key: "riwayat", label: "Riwayat", href: "./riwayat.html", roles: ["owner", "kasir"], icon: "📋" },
  { key: "master-jenis", label: "Master Jenis", href: "./master-jenis.html", roles: ["owner"], icon: "⚙️" },
  { key: "users", label: "Users", href: "./users.html", roles: ["owner"], icon: "👥" },
];

export function getToken() {
  return localStorage.getItem("token") || "";
}

export function getUsername() {
  return localStorage.getItem("username") || "";
}

export function getRole() {
  return localStorage.getItem("role") || "";
}

export function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  localStorage.removeItem("role");
}

export function logout() {
  clearSession();
  window.location.href = "./login.html";
}

window.logout = logout;

export function guardPage(options = {}) {
  const token = getToken();
  const username = getUsername();
  const role = getRole();

  if (!token) {
    window.location.href = "./login.html";
    throw new Error("Unauthorized");
  }

  if (options.ownerOnly && role !== "owner") {
    window.location.href = "./dashboard.html";
    throw new Error("Forbidden");
  }

  return { token, username, role };
}

export async function apiRequest(path, options = {}) {
  const {
    method = "GET",
    body,
    auth = true,
  } = options;

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (auth && getToken()) {
    headers.Authorization = `Bearer ${getToken()}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const rawText = await response.text();
  const data = rawText ? JSON.parse(rawText) : null;

  if (response.status === 401) {
    clearSession();
    window.location.href = "./login.html";
    throw new Error(data?.message || "Sesi login berakhir.");
  }

  if (!response.ok) {
    throw new Error(data?.message || `Request gagal (${response.status})`);
  }

  return data;
}

export function formatCurrency(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export function formatDate(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function humanizeStatus(status) {
  return String(status || "belum_selesai").replaceAll("_", " ");
}

export function getStatusClass(status) {
  if (status === "selesai") return "badge badge-success";
  if (status === "siap_diambil") return "badge badge-info";
  return "badge badge-warning";
}

export function setMessage(element, message, type = "info") {
  element.innerHTML = "";
  if (!message) {
    return;
  }

  const div = document.createElement("div");
  div.className =
    type === "error" ? "notice notice-error" : type === "success" ? "notice notice-success" : "notice notice-info";
  div.textContent = message;
  element.appendChild(div);
}

export function setButtonLoading(button, isLoading, normalLabel, loadingLabel = "Memproses...") {
  button.disabled = isLoading;
  button.textContent = isLoading ? loadingLabel : normalLabel;
}

export function mountSidebar(activeKey, title = "FREZZ LAUNDRY") {
  const sidebar = document.getElementById("sidebar");
  if (!sidebar) {
    return;
  }

  const role = getRole();
  const username = getUsername();

  const links = menuItems
    .filter((item) => item.roles.includes(role))
    .map(
      (item) => `
        <a class="nav-link ${item.key === activeKey ? "active" : ""}" href="${item.href}">
          <span class="nav-icon">${item.icon}</span>
          <span>${item.label}</span>
        </a>
      `,
    )
    .join("");

  sidebar.innerHTML = `
    <div class="sidebar-brand">
      <div class="sidebar-logo">🧺</div>
      <h1>FREZZ LAUNDRY</h1>
    </div>
    
    <nav class="sidebar-nav">
      ${links}
    </nav>
    
    <div class="sidebar-footer">
      <div class="user-info">
        <div class="user-avatar">${username ? username.charAt(0).toUpperCase() : 'U'}</div>
        <div class="user-details">
          <h3 id="headerUsername">${username || 'Pengguna'}</h3>
          <p id="userRole">${role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Guest'}</p>
        </div>
      </div>
      <button id="logoutSidebarButton" class="button button-ghost" type="button">Logout</button>
    </div>
  `;

  const logoutButton = document.getElementById("logoutSidebarButton");
  if (logoutButton) {
    logoutButton.addEventListener("click", logout);
  }
}

export function mountPageHeader(title, subtitle) {
  const heading = document.getElementById("pageHeading");
  if (!heading) {
    return;
  }

  heading.innerHTML = `
    <h2 class="page-title">${title}</h2>
    <p class="page-subtitle">${subtitle}</p>
  `;
}

export function createEmptyState(message) {
  const div = document.createElement("div");
  div.className = "empty-state";
  div.textContent = message;
  return div;
}
