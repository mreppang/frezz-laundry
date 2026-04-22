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

function getNextStatus(status) {
  if (status === "belum_selesai") return "siap_diambil";
  if (status === "siap_diambil") return "selesai";
  return null;
}

function renderDetail(detail) {
  const panel = document.getElementById("detailPanel");
  if (!detail) {
    panel.innerHTML = "";
    panel.appendChild(createEmptyState("Belum ada transaksi dipilih."));
    return;
  }

  const items = detail.details?.length
    ? detail.details
        .map(
          (item) => `
            <div class="list-item">
              <div>
                <strong>${item.nama_jenis}</strong>
                <p>${item.qty} x ${formatCurrency(item.harga)}</p>
              </div>
              <strong>${formatCurrency(item.subtotal)}</strong>
            </div>
          `,
        )
        .join("")
    : `<div class="empty-state">Transaksi kiloan tidak memiliki item detail.</div>`;

  panel.innerHTML = `
    <div class="detail-card">
      <h4>${detail.kode_order}</h4>
      <p>${detail.nama_pelanggan} - ${detail.no_hp}</p>
      <p>Status: <span class="${getStatusClass(detail.status)}">${humanizeStatus(detail.status)}</span></p>
      <p>Total: <strong>${formatCurrency(detail.total_harga)}</strong></p>
      <div class="list-stack">${items}</div>
    </div>
  `;
}

async function loadOrders() {
  const response = await apiRequest("/api/transaksi");
  const orders = response.data;
  const tbody = document.getElementById("ordersTableBody");
  tbody.innerHTML = "";

  if (!orders.length) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 6;
    cell.appendChild(createEmptyState("Belum ada transaksi aktif."));
    row.appendChild(cell);
    tbody.appendChild(row);
    return;
  }

  orders.forEach((item) => {
    const nextStatus = getNextStatus(item.status);
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><strong>${item.kode_order}</strong></td>
      <td>${item.nama_pelanggan}</td>
      <td>${item.layanan}</td>
      <td><span class="${getStatusClass(item.status)}">${humanizeStatus(item.status)}</span></td>
      <td>${formatCurrency(item.total_harga)}</td>
      <td>
        <div class="button-row">
          <button class="button button-ghost small-button" data-detail="${item.id}">Detail</button>
          ${
            nextStatus
              ? `<button class="button button-secondary small-button" data-status="${item.id}" data-next="${nextStatus}">Ubah</button>`
              : ""
          }
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });

  tbody.querySelectorAll("[data-detail]").forEach((button) => {
    button.addEventListener("click", async () => {
      const response = await apiRequest(`/api/transaksi/${button.dataset.detail}`);
      renderDetail(response.data);
    });
  });

  tbody.querySelectorAll("[data-status]").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        const response = await apiRequest(`/api/transaksi/${button.dataset.status}/status`, {
          method: "PATCH",
          body: { status: button.dataset.next },
        });

        setMessage(document.getElementById("messageBox"), response.message, "success");
        if (response.data.whatsapp_link) {
          document.getElementById("detailPanel").innerHTML = `
            <div class="notice notice-success">
              Status berubah ke siap diambil.
              <div class="button-row" style="margin-top:12px;">
                <a class="button button-primary" href="${response.data.whatsapp_link}" target="_blank" rel="noreferrer">Kirim WhatsApp</a>
              </div>
            </div>
          `;
        }
        await loadOrders();
      } catch (error) {
        setMessage(document.getElementById("messageBox"), error.message, "error");
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    guardPage();
    mountSidebar("daftar-cucian");
    mountPageHeader("Daftar Cucian", "Pantau transaksi aktif dan ubah status pengerjaan cucian.");
    renderDetail(null);
    await loadOrders();
  } catch (error) {
    setMessage(document.getElementById("messageBox"), error.message, "error");
  }
});
