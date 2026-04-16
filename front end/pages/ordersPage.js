import {
  createButton,
  createEmptyState,
  createInfoBox,
  formatCurrency,
  formatDate,
  getStatusBadgeClass,
  humanizeStatus,
} from "../components/ui.js";
import { fetchTransactions, updateTransactionStatus } from "../services/api.js";

function orderCode(item) {
  return item.kode_order || item.kodeOrder || item.id || item._id || "-";
}

function customerName(item) {
  return item.nama_pelanggan || item.namaPelanggan || "-";
}

function phone(item) {
  return item.nomor_hp || item.no_hp || item.phone || "";
}

function total(item) {
  return item.total_harga || item.totalHarga || item.total || 0;
}

function nextStatus(status) {
  if (status === "belum_selesai") {
    return "siap_diambil";
  }
  if (status === "siap_diambil") {
    return "selesai";
  }
  return null;
}

function waLink(item) {
  const cleanPhone = phone(item).replace(/\D/g, "");
  const text = `Halo ${customerName(item)}, laundry dengan kode order ${orderCode(item)} sudah siap diambil. Terima kasih.`;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

export async function renderOrdersPage(root) {
  root.innerHTML = "";
  root.appendChild(createInfoBox("Memuat daftar cucian...", "loading"));

  async function load() {
    try {
      const transactions = await fetchTransactions();
      const activeOrders = transactions.filter((item) => item.status !== "selesai");
      root.innerHTML = "";

      const card = document.createElement("section");
      card.className = "table-card";
      card.innerHTML = `
        <h3 class="section-title">Order Aktif</h3>
        <p class="section-subtitle">Update status order dari belum selesai sampai selesai diambil pelanggan.</p>
      `;

      if (!activeOrders.length) {
        card.appendChild(createEmptyState("Semua order sudah selesai atau belum ada transaksi aktif."));
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
            <th>Dibuat</th>
            <th>Aksi</th>
          </tr>
        </thead>
      `;

      const body = document.createElement("tbody");
      activeOrders.forEach((item) => {
        const status = item.status || "belum_selesai";
        const row = document.createElement("tr");
        row.innerHTML = `
          <td><strong>${orderCode(item)}</strong></td>
          <td><strong>${customerName(item)}</strong><div class="muted">${phone(item) || "-"}</div></td>
          <td>${item.layanan || "-"}</td>
          <td>${formatCurrency(total(item))}</td>
          <td><span class="${getStatusBadgeClass(status)}">${humanizeStatus(status)}</span></td>
          <td>${formatDate(item.createdAt || item.tanggal)}</td>
          <td></td>
        `;

        const actionCell = row.lastElementChild;
        const actionWrap = document.createElement("div");
        actionWrap.className = "actions-row";
        const next = nextStatus(status);
        if (next) {
          const statusButton = createButton(`Ubah ke ${humanizeStatus(next)}`, "btn btn-secondary", async () => {
            statusButton.disabled = true;
            statusButton.textContent = "Menyimpan...";
            try {
              await updateTransactionStatus(item, next);
              await load();
            } catch (error) {
              alert(error.message);
            }
          });
          actionWrap.appendChild(statusButton);
        }
        if (status === "siap_diambil" && phone(item)) {
          const link = document.createElement("a");
          link.className = "btn btn-primary";
          link.target = "_blank";
          link.rel = "noreferrer";
          link.href = waLink(item);
          link.textContent = "Kirim WhatsApp";
          actionWrap.appendChild(link);
        }
        actionCell.appendChild(actionWrap);
        body.appendChild(row);
      });

      table.appendChild(body);
      wrapper.appendChild(table);
      card.appendChild(wrapper);
      root.appendChild(card);
    } catch (error) {
      root.innerHTML = "";
      root.appendChild(createInfoBox(error.message, "error"));
    }
  }

  await load();
}
