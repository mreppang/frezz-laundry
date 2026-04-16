import {
  createEmptyState,
  createInfoBox,
  formatCurrency,
  formatDate,
  getStatusBadgeClass,
  humanizeStatus,
} from "../components/ui.js";
import { fetchTransactions } from "../services/api.js";

export async function renderHistoryPage(root) {
  root.innerHTML = "";
  root.appendChild(createInfoBox("Memuat riwayat transaksi...", "loading"));

  try {
    const transactions = await fetchTransactions();
    const completed = transactions.filter((item) => item.status === "selesai");

    root.innerHTML = "";
    const card = document.createElement("section");
    card.className = "table-card";
    card.innerHTML = `
      <h3 class="section-title">Riwayat Selesai</h3>
      <p class="section-subtitle">Transaksi yang sudah selesai dan telah diambil pelanggan.</p>
    `;

    if (!completed.length) {
      card.appendChild(createEmptyState("Belum ada transaksi selesai."));
      root.appendChild(card);
      return;
    }

    const wrapper = document.createElement("div");
    wrapper.className = "table-wrapper";
    const table = document.createElement("table");
    table.className = "data-table";
    table.innerHTML = `
      <thead>
        <tr>
          <th>Kode Order</th>
          <th>Pelanggan</th>
          <th>Layanan</th>
          <th>Total</th>
          <th>Status</th>
          <th>Tanggal</th>
        </tr>
      </thead>
      <tbody>
        ${completed
          .map(
            (item) => `
              <tr>
                <td><strong>${item.kode_order || item.kodeOrder || "-"}</strong></td>
                <td>${item.nama_pelanggan || item.namaPelanggan || "-"}</td>
                <td>${item.layanan || "-"}</td>
                <td>${formatCurrency(item.total_harga || item.totalHarga || item.total || 0)}</td>
                <td><span class="${getStatusBadgeClass(item.status)}">${humanizeStatus(item.status)}</span></td>
                <td>${formatDate(item.updatedAt || item.createdAt || item.tanggal)}</td>
              </tr>
            `,
          )
          .join("")}
      </tbody>
    `;
    wrapper.appendChild(table);
    card.appendChild(wrapper);
    root.appendChild(card);
  } catch (error) {
    root.innerHTML = "";
    root.appendChild(createInfoBox(error.message, "error"));
  }
}
