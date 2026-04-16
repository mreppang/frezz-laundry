import {
  createButton,
  createEmptyState,
  createInfoBox,
  formatCurrency,
  humanizeStatus,
} from "../components/ui.js";
import { fetchTransactions } from "../services/api.js";

function isOwner(role) {
  return String(role || "").toLowerCase() === "owner";
}

function createStatCard(label, value, note) {
  const card = document.createElement("article");
  card.className = "stat-card";
  card.innerHTML = `
    <p class="stat-label">${label}</p>
    <p class="stat-value">${value}</p>
    <p class="stat-note">${note}</p>
  `;
  return card;
}

function summarize(transactions) {
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  return transactions.reduce(
    (acc, item) => {
      const total = Number(item.total_harga || item.totalHarga || item.total || 0);
      const date = new Date(item.createdAt || item.tanggal || item.updatedAt || now);
      const dayKey = date.toISOString().slice(0, 10);
      const itemMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const status = String(item.status || "belum_selesai");

      acc.all += total;
      if (dayKey === today) {
        acc.daily += total;
      }
      if (itemMonth === monthKey) {
        acc.monthly += total;
      }
      acc.status[status] = (acc.status[status] || 0) + 1;
      return acc;
    },
    { daily: 0, monthly: 0, all: 0, status: {} },
  );
}

export async function renderDashboardPage(root, { auth, navigate }) {
  root.innerHTML = "";
  root.appendChild(createInfoBox("Memuat ringkasan dashboard...", "loading"));

  try {
    const transactions = await fetchTransactions();
    const summary = summarize(transactions);
    const owner = isOwner(auth?.user?.role);

    root.innerHTML = "";

    const quick = document.createElement("section");
    quick.className = "card toolbar-card";
    quick.innerHTML = `
      <div>
        <h3 class="section-title">Aksi Cepat</h3>
        <p class="section-subtitle">Masuk ke alur kasir yang paling sering dipakai.</p>
      </div>
    `;
    const actions = document.createElement("div");
    actions.className = "actions-row";
    actions.append(
      createButton("Transaksi Baru", "btn btn-primary", () => navigate("#/transaksi-baru")),
      createButton("Daftar Cucian", "btn btn-secondary", () => navigate("#/daftar-cucian")),
      createButton("Riwayat", "btn btn-secondary", () => navigate("#/riwayat")),
    );
    if (owner) {
      actions.append(
        createButton("Jenis Pakaian", "btn btn-secondary", () => navigate("#/jenis-pakaian")),
        createButton("Buat Akun", "btn btn-secondary", () => navigate("#/buat-akun")),
      );
    }
    quick.appendChild(actions);

    const stats = document.createElement("section");
    stats.className = `card-grid ${owner ? "cols-3" : "cols-2"}`;
    stats.appendChild(
      createStatCard("Pendapatan Harian", formatCurrency(summary.daily), "Akumulasi transaksi hari ini."),
    );
    if (owner) {
      stats.appendChild(
        createStatCard("Pendapatan Bulanan", formatCurrency(summary.monthly), "Performa bulan berjalan."),
      );
      stats.appendChild(
        createStatCard("Total Keseluruhan", formatCurrency(summary.all), "Semua transaksi yang tercatat."),
      );
    } else {
      stats.appendChild(
        createStatCard(
          "Order Aktif",
          String(transactions.filter((item) => item.status !== "selesai").length),
          "Jumlah cucian yang masih diproses.",
        ),
      );
    }

    const overview = document.createElement("section");
    overview.className = "card-grid cols-2";

    const statusCard = document.createElement("article");
    statusCard.className = "card";
    statusCard.innerHTML = `
      <h3 class="section-title">Status Cucian</h3>
      <p class="section-subtitle">Ringkasan progres order yang sedang berjalan.</p>
    `;
    const statusList = document.createElement("div");
    statusList.className = "card-grid";
    ["belum_selesai", "siap_diambil", "selesai"].forEach((status) => {
      const box = document.createElement("div");
      box.className = "summary-box";
      box.innerHTML = `
        <p class="summary-label">${humanizeStatus(status)}</p>
        <p class="summary-value">${summary.status[status] || 0}</p>
      `;
      statusList.appendChild(box);
    });
    statusCard.appendChild(statusList);

    const latestCard = document.createElement("article");
    latestCard.className = "card";
    latestCard.innerHTML = `
      <h3 class="section-title">Transaksi Terbaru</h3>
      <p class="section-subtitle">Lima order terakhir yang masuk ke sistem.</p>
    `;
    const latestList = document.createElement("div");
    latestList.className = "item-list";
    const latest = [...transactions].slice(0, 5);
    if (!latest.length) {
      latestList.appendChild(createEmptyState("Belum ada transaksi yang tercatat."));
    } else {
      latest.forEach((item) => {
        const row = document.createElement("div");
        row.className = "item-row";
        row.innerHTML = `
          <div>
            <strong>${item.kode_order || item.kodeOrder || "-"}</strong>
            <p class="section-subtitle">${item.nama_pelanggan || item.namaPelanggan || "-"} - ${item.layanan || "-"}</p>
          </div>
          <div style="text-align: right;">
            <strong>${formatCurrency(item.total_harga || item.totalHarga || item.total || 0)}</strong>
            <p class="section-subtitle">${humanizeStatus(item.status)}</p>
          </div>
        `;
        latestList.appendChild(row);
      });
    }
    latestCard.appendChild(latestList);

    overview.append(statusCard, latestCard);
    root.append(quick, stats, overview);
  } catch (error) {
    root.innerHTML = "";
    root.appendChild(createInfoBox(error.message, "error"));
  }
}
