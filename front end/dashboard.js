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

function createStat(label, value, icon = "📊", change = null) {
  const changeHtml = change ? `
    <div class="stat-change ${change >= 0 ? 'positive' : 'negative'}">
      <span>${change >= 0 ? '📈' : '📉'}</span>
      <span>${Math.abs(change)}%</span>
    </div>
  ` : '';
  
  return `
    <div class="stat-card">
      <div class="stat-icon">${icon}</div>
      <div class="stat-value">${value}</div>
      <div class="stat-label">${label}</div>
      ${changeHtml}
    </div>
  `;
}

function getStatusBadge(status) {
  const statusClass = {
    'belum_selesai': 'pending',
    'siap_diambil': 'active', 
    'selesai': 'completed'
  }[status] || 'pending';
  
  return `<span class="status-badge ${statusClass}">${humanizeStatus(status)}</span>`;
}

async function loadDashboard() {
  guardPage();
  mountSidebar("dashboard");
  mountPageHeader("Dashboard", "Selamat Datang! 👋 Kelola Laundry Anda Dengan Mudah");

  const role = getRole();

  try {
    const [statsResponse, latestResponse] = await Promise.all([
      apiRequest("/api/dashboard/stats"),
      apiRequest("/api/transaksi/latest"),
    ]);

    const stats = statsResponse.data;
    const latest = latestResponse.data;

    // Update statistics cards
    const statsGrid = document.getElementById("statsGrid");
    statsGrid.innerHTML = "";

    if (role === "owner") {
      statsGrid.innerHTML = `
        ${createStat("Pendapatan Hari Ini", formatCurrency(stats.pendapatan_hari_ini), "💰", 12)}
        ${createStat("Transaksi Hari Ini", "0", "📋", 8)}
        ${createStat("Cucian Aktif", stats.cucian_aktif || 0, "👕", -5)}
        ${createStat("Siap Diambil", stats.siap_diambil || 0, "✅", 15)}
        ${createStat("Pelanggan Hari Ini", "0", "👥", 20)}
        ${createStat("Total Pendapatan", formatCurrency(stats.total_pendapatan), "📈", 25)}
      `;
    } else {
      statsGrid.innerHTML = `
        ${createStat("Pendapatan Hari Ini", formatCurrency(stats.pendapatan_hari_ini), "💰", 12)}
        ${createStat("Cucian Aktif", stats.cucian_aktif || 0, "👕", -5)}
        ${createStat("Siap Diambil", stats.siap_diambil || 0, "✅", 15)}
        ${createStat("Selesai", stats.selesai || 0, "🎉", 8)}
      `;
    }

    // Update latest transactions table
    const tbody = document.getElementById("latestTableBody");
    tbody.innerHTML = "";

    if (!latest.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6">
            <div class="empty-state">
              <div class="empty-state-icon">📭</div>
              <div class="empty-state-title">Belum ada transaksi</div>
              <div class="empty-state-description">Transaksi terbaru akan muncul di sini</div>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    latest.forEach((item) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td><strong>${item.kode_order}</strong></td>
        <td>${item.nama_pelanggan}</td>
        <td>${item.layanan}</td>
        <td>${formatCurrency(item.total_harga)}</td>
        <td>${getStatusBadge(item.status)}</td>
        <td>
          <div class="action-buttons">
            <button class="btn-action btn-view">Detail</button>
            ${item.status !== 'selesai' ? `<button class="btn-action btn-complete">Selesai</button>` : ''}
          </div>
        </td>
      `;
      tbody.appendChild(row);
    });
  } catch (error) {
    setMessage(document.getElementById("messageBox"), error.message, "error");
  }
}

document.addEventListener("DOMContentLoaded", loadDashboard);
