import {
  apiRequest,
  createEmptyState,
  formatCurrency,
  formatDate,
  getStatusClass,
  guardPage,
  humanizeStatus,
  mountPageHeader,
  mountSidebar,
  setMessage,
} from "./shared.js";

async function loadRiwayat() {
  const nama = document.getElementById("searchNama").value.trim();
  const kode = document.getElementById("searchKode").value.trim();
  const tanggal = document.getElementById("searchTanggal").value;

  const params = new URLSearchParams();
  if (nama) params.set("nama", nama);
  if (kode) params.set("kode", kode);
  if (tanggal) params.set("tanggal", tanggal);

  const response = await apiRequest(`/api/riwayat${params.toString() ? `?${params.toString()}` : ""}`);
  const tbody = document.getElementById("riwayatTableBody");
  tbody.innerHTML = "";

  if (!response.data.length) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 5;
    cell.appendChild(createEmptyState("Belum ada riwayat transaksi selesai."));
    row.appendChild(cell);
    tbody.appendChild(row);
    return;
  }

  response.data.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><strong>${item.kode_order}</strong></td>
      <td>${item.nama_pelanggan}</td>
      <td>${formatDate(item.selesai_at)}</td>
      <td>${formatCurrency(item.total_harga)}</td>
      <td><span class="${getStatusClass("selesai")}">${humanizeStatus("selesai")}</span></td>
    `;
    tbody.appendChild(row);
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    guardPage();
    mountSidebar("riwayat");
    mountPageHeader("Riwayat", "Cari transaksi selesai berdasarkan nama, kode order, atau tanggal.");
    document.getElementById("searchForm").addEventListener("submit", async (event) => {
      event.preventDefault();
      try {
        await loadRiwayat();
      } catch (error) {
        setMessage(document.getElementById("messageBox"), error.message, "error");
      }
    });
    await loadRiwayat();
  } catch (error) {
    setMessage(document.getElementById("messageBox"), error.message, "error");
  }
});
