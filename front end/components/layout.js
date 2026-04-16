const navItems = [
  { route: "#/dashboard", label: "Dashboard", icon: "DB" },
  { route: "#/transaksi-baru", label: "Transaksi Baru", icon: "TR" },
  { route: "#/daftar-cucian", label: "Daftar Cucian", icon: "DC" },
  { route: "#/riwayat", label: "Riwayat", icon: "RH" },
  { route: "#/jenis-pakaian", label: "Jenis Pakaian", icon: "JP", ownerOnly: true },
  { route: "#/buat-akun", label: "Buat Akun", icon: "AK", ownerOnly: true },
];

function isOwner(user) {
  return String(user?.role || "").toLowerCase() === "owner";
}

export function renderLayout(root, { title, subtitle, activeRoute, user, onNavigate, onLogout }) {
  root.innerHTML = "";

  const shell = document.createElement("div");
  shell.className = "app-shell";

  const sidebar = document.createElement("aside");
  sidebar.className = "sidebar";
  sidebar.innerHTML = `
    <div class="brand">
      <p class="helper-text" style="color: rgba(239,252,255,0.72); margin: 0;">Laundry Management</p>
      <h1 class="brand-title">Laundry POS</h1>
      <p class="brand-subtitle" style="color: rgba(239,252,255,0.72);">
        Kasir modern untuk operasional harian yang cepat dan rapi.
      </p>
    </div>
  `;

  const navList = document.createElement("div");
  navList.className = "nav-list";

  navItems
    .filter((item) => !item.ownerOnly || isOwner(user))
    .forEach((item) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `nav-item ${item.route === activeRoute ? "active" : ""}`;
      button.innerHTML = `<span>${item.icon}</span><span>${item.label}</span>`;
      button.addEventListener("click", () => onNavigate(item.route));
      navList.appendChild(button);
    });

  const footer = document.createElement("div");
  footer.className = "sidebar-footer";

  const userCard = document.createElement("div");
  userCard.className = "card";
  userCard.style.background = "rgba(255,255,255,0.08)";
  userCard.style.borderColor = "rgba(255,255,255,0.12)";
  userCard.style.color = "#effcff";
  userCard.innerHTML = `
    <strong>${user?.nama || user?.username || "Pengguna"}</strong>
    <p class="user-meta" style="color: rgba(239,252,255,0.72);">${String(user?.role || "kasir").toUpperCase()}</p>
  `;

  const logoutButton = document.createElement("button");
  logoutButton.type = "button";
  logoutButton.className = "btn btn-ghost";
  logoutButton.style.color = "#effcff";
  logoutButton.style.borderColor = "rgba(255,255,255,0.16)";
  logoutButton.textContent = "Keluar";
  logoutButton.addEventListener("click", onLogout);

  footer.append(userCard, logoutButton);
  sidebar.append(navList, footer);

  const main = document.createElement("main");
  main.className = "main-content";

  const topbar = document.createElement("section");
  topbar.className = "topbar";
  topbar.innerHTML = `
    <div>
      <h2 class="page-title">${title}</h2>
      <p class="page-subtitle">${subtitle}</p>
    </div>
  `;

  const todayCard = document.createElement("div");
  todayCard.className = "card toolbar-card";
  todayCard.style.padding = "16px 20px";
  todayCard.innerHTML = `
    <div>
      <strong>Siap melayani</strong>
      <p class="section-subtitle">
        ${new Intl.DateTimeFormat("id-ID", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(new Date())}
      </p>
    </div>
  `;

  topbar.appendChild(todayCard);

  const content = document.createElement("section");
  content.className = "card-grid";

  main.append(topbar, content);
  shell.append(sidebar, main);
  root.appendChild(shell);

  return { content };
}
