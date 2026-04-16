import { renderLayout } from "./components/layout.js";
import { clearAuth, getAuth } from "./services/auth.js";
import { renderCreateAccountPage } from "./pages/createAccountPage.js";
import { renderDashboardPage } from "./pages/dashboardPage.js";
import { renderHistoryPage } from "./pages/historyPage.js";
import { renderLoginPage } from "./pages/loginPage.js";
import { renderClothingTypesPage } from "./pages/clothingTypesPage.js";
import { renderNewTransactionPage } from "./pages/newTransactionPage.js";
import { renderOrdersPage } from "./pages/ordersPage.js";

const routes = {
  "#/dashboard": {
    title: "Dashboard",
    subtitle: "Ringkasan operasional laundry hari ini.",
    render: renderDashboardPage,
  },
  "#/transaksi-baru": {
    title: "Transaksi Baru",
    subtitle: "Input cucian pelanggan dengan cepat dan akurat.",
    render: renderNewTransactionPage,
  },
  "#/daftar-cucian": {
    title: "Daftar Cucian",
    subtitle: "Pantau order aktif dan update status pengerjaan.",
    render: renderOrdersPage,
  },
  "#/riwayat": {
    title: "Riwayat Selesai",
    subtitle: "Transaksi yang telah selesai diambil pelanggan.",
    render: renderHistoryPage,
  },
  "#/jenis-pakaian": {
    title: "Jenis Pakaian",
    subtitle: "Kelola item satuan dan harga khusus owner.",
    ownerOnly: true,
    render: renderClothingTypesPage,
  },
  "#/buat-akun": {
    title: "Buat Akun",
    subtitle: "Tambahkan akun owner atau kasir baru.",
    ownerOnly: true,
    render: renderCreateAccountPage,
  },
};

function routeHash() {
  return window.location.hash || "#/dashboard";
}

function normalizeHash(hash) {
  if (hash === "#/" || hash === "#") {
    return "#/dashboard";
  }
  return hash;
}

function isOwner(user) {
  return String(user?.role || "").toLowerCase() === "owner";
}

function ensureSafeRoute(hash, auth) {
  const route = routes[hash];
  if (!route) {
    return "#/dashboard";
  }
  if (route.ownerOnly && !isOwner(auth?.user)) {
    return "#/dashboard";
  }
  return hash;
}

function redirect(hash) {
  window.location.hash = hash;
}

async function renderApp() {
  const root = document.getElementById("app");
  const auth = getAuth();
  const hash = normalizeHash(routeHash());

  if (!auth) {
    if (hash !== "#/login") {
      redirect("#/login");
      return;
    }
    root.innerHTML = "";
    await renderLoginPage(root, {
      onLoginSuccess() {
        redirect("#/dashboard");
      },
    });
    return;
  }

  if (hash === "#/login") {
    redirect("#/dashboard");
    return;
  }

  const safeHash = ensureSafeRoute(hash, auth);
  if (safeHash !== hash) {
    redirect(safeHash);
    return;
  }

  const route = routes[safeHash];
  const shell = renderLayout(root, {
    title: route.title,
    subtitle: route.subtitle,
    activeRoute: safeHash,
    user: auth.user,
    onNavigate: redirect,
    onLogout() {
      clearAuth();
      redirect("#/login");
    },
  });

  await route.render(shell.content, { auth, navigate: redirect });
}

window.addEventListener("hashchange", renderApp);
window.addEventListener("DOMContentLoaded", () => {
  if (!window.location.hash) {
    redirect(getAuth() ? "#/dashboard" : "#/login");
    return;
  }
  renderApp();
});
