import {
  apiRequest,
  createEmptyState,
  formatCurrency,
  getRole,
  getStatusClass,
  getUsername,
  guardPage,
  humanizeStatus,
  mountPageHeader,
  mountSidebar,
  setMessage,
} from "./shared.js";

function createStat(label, value, note = "") {
  return `
    <article class="stat-card">
      <span class="stat-label">${label}</span>
      <strong class="stat-value">${value}</strong>
      ${note ? `<span class="stat-note">${note}</span>` : ""}
    </article>
  `;
}

async function loadDashboard() {
  guardPage();
  mountSidebar("dashboard");
  mountPageHeader("Dashboard", "Ringkasan performa laundry hari ini dan bulan berjalan.");
  document.getElementById("headerUsername").textContent = getUsername() || "-";

  try {
    const [statsResponse, latestResponse] = await Promise.all([
      apiRequest("/api/dashboard/stats"),
      apiRequest("/api/transaksi/latest"),
    ]);

    const stats = statsResponse.data;
    const latest = latestResponse.data;
    const role = getRole();

    const statsGrid = document.getElementById("statsGrid");
    statsGrid.innerHTML = "";

    if (role === "owner") {
      statsGrid.innerHTML = `
        ${createStat("Pendapatan Hari Ini", formatCurrency(stats.pendapatan_hari_ini))}
        ${createStat("Pendapatan Bulan Ini", formatCurrency(stats.pendapatan_bulan_ini))}
        ${createStat("Total Pendapatan", formatCurrency(stats.total_pendapatan))}
        ${createStat("Cucian Aktif", stats.cucian_aktif || 0)}
        ${createStat("Siap Diambil", stats.siap_diambil || 0)}
        ${createStat("Selesai", stats.selesai || 0)}
      `;
    } else {
      statsGrid.innerHTML = `
        ${createStat("Pendapatan Hari Ini", formatCurrency(stats.pendapatan_hari_ini))}
        ${createStat("Cucian Aktif", stats.cucian_aktif || 0)}
        ${createStat("Siap Diambil", stats.siap_diambil || 0)}
        ${createStat("Selesai", stats.selesai || 0)}
      `;
    }

    const tbody = document.getElementById("latestTableBody");
    tbody.innerHTML = "";

    if (!latest.length) {
      const row = document.createElement("tr");
      const cell = document.createElement("td");
      cell.colSpan = 5;
      cell.appendChild(createEmptyState("Belum ada transaksi terbaru."));
      row.appendChild(cell);
      tbody.appendChild(row);
      return;
    }

    latest.forEach((item) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td><strong>${item.kode_order}</strong></td>
        <td>${item.nama_pelanggan}</td>
        <td>${item.layanan}</td>
        <td>${formatCurrency(item.total_harga)}</td>
        <td><span class="${getStatusClass(item.status)}">${humanizeStatus(item.status)}</span></td>
      `;
      tbody.appendChild(row);
    });
  } catch (error) {
    setMessage(document.getElementById("messageBox"), error.message, "error");
  }
}

document.addEventListener("DOMContentLoaded", loadDashboard);
