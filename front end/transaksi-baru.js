import {
  apiRequest,
  createEmptyState,
  formatCurrency,
  guardPage,
  mountPageHeader,
  mountSidebar,
  setButtonLoading,
  setMessage,
} from "./shared.js";

const HARGA_KILOAN = 10000;
const TAMBAHAN_EXPRESS = 10000;
let jenisData = [];
let items = [];

function renderJenisOptions() {
  const select = document.getElementById("jenisSelect");
  select.innerHTML = jenisData
    .map((item) => `<option value="${item.id}">${item.nama_jenis} - ${formatCurrency(item.harga)}</option>`)
    .join("");
}

function calculateTotal() {
  const layanan = document.getElementById("layanan").value;
  const paket = document.getElementById("paket").value;
  let total = 0;

  if (layanan === "kiloan") {
    total = Number(document.getElementById("beratKg").value || 0) * HARGA_KILOAN;
  } else {
    total = items.reduce((sum, item) => sum + item.subtotal, 0);
  }

  if (paket === "express") {
    total += TAMBAHAN_EXPRESS;
  }

  document.getElementById("totalHarga").textContent = formatCurrency(total);
  return total;
}

function renderItems() {
  const container = document.getElementById("itemList");
  container.innerHTML = "";

  const layanan = document.getElementById("layanan").value;
  if (layanan === "kiloan") {
    container.appendChild(createEmptyState("Mode kiloan aktif. Total dihitung dari berat x Rp 10.000."));
    calculateTotal();
    return;
  }

  if (!items.length) {
    container.appendChild(createEmptyState("Belum ada item satuan yang ditambahkan."));
    calculateTotal();
    return;
  }

  items.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "list-item";
    row.innerHTML = `
      <div>
        <strong>${item.nama_jenis}</strong>
        <p>${item.qty} x ${formatCurrency(item.harga)}</p>
      </div>
      <div class="button-row">
        <strong>${formatCurrency(item.subtotal)}</strong>
        <button type="button" class="button button-ghost small-button" data-index="${index}">Hapus</button>
      </div>
    `;
    container.appendChild(row);
  });

  container.querySelectorAll("[data-index]").forEach((button) => {
    button.addEventListener("click", () => {
      items.splice(Number(button.dataset.index), 1);
      renderItems();
    });
  });

  calculateTotal();
}

function toggleFields() {
  const layanan = document.getElementById("layanan").value;
  document.getElementById("kiloanFields").classList.toggle("hidden", layanan !== "kiloan");
  document.getElementById("satuanFields").classList.toggle("hidden", layanan !== "satuan");
  renderItems();
}

function addItem() {
  const jenisId = Number(document.getElementById("jenisSelect").value);
  const qty = Number(document.getElementById("qtyInput").value || 0);
  const jenis = jenisData.find((item) => item.id === jenisId);

  if (!jenis || qty <= 0) {
    return;
  }

  items.push({
    jenis_id: jenis.id,
    nama_jenis: jenis.nama_jenis,
    qty,
    harga: Number(jenis.harga),
    subtotal: qty * Number(jenis.harga),
  });

  renderItems();
}

async function submitTransaksi(event) {
  event.preventDefault();
  const saveButton = document.getElementById("saveButton");
  setMessage(document.getElementById("messageBox"), "");
  setButtonLoading(saveButton, true, "Simpan Transaksi", "Menyimpan...");

  try {
    const layanan = document.getElementById("layanan").value;
    const payload = {
      nama: document.getElementById("nama").value.trim(),
      no_hp: document.getElementById("noHp").value.trim(),
      layanan,
      paket: document.getElementById("paket").value,
      berat_kg: layanan === "kiloan" ? Number(document.getElementById("beratKg").value || 0) : null,
      items: layanan === "satuan" ? items.map(({ jenis_id, qty }) => ({ jenis_id, qty })) : [],
    };

    const response = await apiRequest("/api/transaksi", {
      method: "POST",
      body: payload,
    });

    document.getElementById("transaksiForm").reset();
    items = [];
    toggleFields();
    renderJenisOptions();

    setMessage(document.getElementById("messageBox"), response.message, "success");
    document.getElementById("resultBox").innerHTML = `
      <div class="notice notice-success">
        <strong>Kode Order:</strong> ${response.data.kode_order}<br />
        <strong>Total:</strong> ${formatCurrency(response.data.total_harga)}
      </div>
    `;
  } catch (error) {
    setMessage(document.getElementById("messageBox"), error.message, "error");
  } finally {
    setButtonLoading(saveButton, false, "Simpan Transaksi");
  }
}

async function initPage() {
  guardPage();
  mountSidebar("transaksi-baru");
  mountPageHeader("Transaksi Baru", "Buat transaksi laundry kiloan atau satuan dengan total otomatis.");

  const response = await apiRequest("/api/jenis");
  jenisData = response.data;
  renderJenisOptions();
  toggleFields();

  document.getElementById("layanan").addEventListener("change", toggleFields);
  document.getElementById("paket").addEventListener("change", calculateTotal);
  document.getElementById("beratKg").addEventListener("input", calculateTotal);
  document.getElementById("addItemButton").addEventListener("click", addItem);
  document.getElementById("transaksiForm").addEventListener("submit", submitTransaksi);
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    await initPage();
  } catch (error) {
    setMessage(document.getElementById("messageBox"), error.message, "error");
  }
});
