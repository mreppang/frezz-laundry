import { createButton, createInfoBox, createSectionHeader, formatCurrency } from "../components/ui.js";
import { createTransaction, fetchClothingTypes } from "../services/api.js";

const KILOAN_RATE = 10000;
const EXPRESS_FEE = 10000;

function itemId(item) {
  return item.id || item._id || item.kode || item.nama;
}

function itemName(item) {
  return item.nama || item.nama_jenis || item.name || "Jenis";
}

function itemPrice(item) {
  return Number(item.harga || item.price || item.tarif || 0);
}

function totalPrice({ layanan, paket, beratKg, items }) {
  let total = 0;
  if (layanan === "kiloan") {
    total = Number(beratKg || 0) * KILOAN_RATE;
  } else {
    total = items.reduce((sum, item) => sum + Number(item.jumlah || 0) * Number(item.harga || 0), 0);
  }
  if (paket === "express") {
    total += EXPRESS_FEE;
  }
  return total;
}

export async function renderNewTransactionPage(root) {
  root.innerHTML = "";
  root.appendChild(createInfoBox("Menyiapkan form transaksi...", "loading"));

  let clothingTypes = [];
  try {
    clothingTypes = await fetchClothingTypes();
  } catch {
    clothingTypes = [];
  }

  root.innerHTML = "";

  const card = document.createElement("section");
  card.className = "card";
  card.appendChild(
    createSectionHeader("Input Transaksi", "Isi data pelanggan dan detail laundry, total akan dihitung otomatis."),
  );

  const messageBox = document.createElement("div");
  const form = document.createElement("form");
  form.className = "form-grid";
  form.innerHTML = `
    <div class="form-grid cols-2">
      <div class="field">
        <label for="nama-pelanggan">Nama Pelanggan</label>
        <input class="input" id="nama-pelanggan" name="nama_pelanggan" placeholder="Contoh: Budi Santoso" required />
      </div>
      <div class="field">
        <label for="nomor-hp">Nomor HP</label>
        <input class="input" id="nomor-hp" name="nomor_hp" placeholder="08xxxxxxxxxx" required />
      </div>
    </div>
    <div class="form-grid cols-2">
      <div class="field">
        <label for="layanan">Layanan</label>
        <select class="select" id="layanan" name="layanan">
          <option value="kiloan">Kiloan</option>
          <option value="satuan">Satuan</option>
        </select>
      </div>
      <div class="field">
        <label for="paket">Paket</label>
        <select class="select" id="paket" name="paket">
          <option value="normal">Normal</option>
          <option value="express">Express</option>
        </select>
      </div>
    </div>
  `;

  const dynamicArea = document.createElement("div");
  dynamicArea.className = "card-grid";
  const totalBox = document.createElement("div");
  totalBox.className = "summary-box";
  const actions = document.createElement("div");
  actions.className = "actions-row";
  const submitButton = createButton("Simpan Transaksi", "btn btn-primary", null, "submit");
  actions.appendChild(submitButton);

  const items = [];

  function renderItems(listElement) {
    listElement.innerHTML = "";
    if (!items.length) {
      const empty = document.createElement("div");
      empty.className = "empty-state";
      empty.textContent = "Belum ada item satuan yang ditambahkan.";
      listElement.appendChild(empty);
      return;
    }

    items.forEach((item, index) => {
      const row = document.createElement("div");
      row.className = "item-row";
      row.innerHTML = `
        <div>
          <strong>${item.nama}</strong>
          <p class="section-subtitle">${item.jumlah} x ${formatCurrency(item.harga)}</p>
        </div>
        <div class="inline-actions">
          <strong>${formatCurrency(item.subtotal)}</strong>
        </div>
      `;
      const removeButton = createButton("Hapus", "btn btn-danger", () => {
        items.splice(index, 1);
        renderDynamic();
      });
      row.querySelector(".inline-actions").appendChild(removeButton);
      listElement.appendChild(row);
    });
  }

  function renderDynamic() {
    const layanan = form.elements.layanan.value;
    dynamicArea.innerHTML = "";

    if (layanan === "kiloan") {
      const kiloCard = document.createElement("div");
      kiloCard.className = "card";
      kiloCard.innerHTML = `
        <div class="field">
          <label for="berat-kg">Berat (kg)</label>
          <input class="input" id="berat-kg" name="berat_kg" type="number" min="0" step="0.1" placeholder="Masukkan berat cucian" />
          <p class="section-subtitle">Tarif kiloan dihitung ${formatCurrency(KILOAN_RATE)} per kg.</p>
        </div>
      `;
      dynamicArea.appendChild(kiloCard);
    } else {
      const wrapper = document.createElement("div");
      wrapper.className = "card-grid cols-2";

      const addCard = document.createElement("div");
      addCard.className = "card";
      addCard.innerHTML = `
        <h3 class="section-title">Tambah Item Satuan</h3>
        <p class="section-subtitle">Pilih jenis pakaian lalu tambahkan jumlah item.</p>
      `;
      const itemForm = document.createElement("div");
      itemForm.className = "form-grid cols-2";
      itemForm.innerHTML = `
        <div class="field">
          <label for="jenis-item">Jenis Pakaian</label>
          <select class="select" id="jenis-item">
            ${
              clothingTypes.length
                ? clothingTypes
                    .map(
                      (item) =>
                        `<option value="${itemId(item)}">${itemName(item)} - ${formatCurrency(itemPrice(item))}</option>`,
                    )
                    .join("")
                : '<option value="">Belum ada data jenis pakaian</option>'
            }
          </select>
        </div>
        <div class="field">
          <label for="jumlah-item">Jumlah</label>
          <input class="input" id="jumlah-item" type="number" min="1" value="1" />
        </div>
      `;
      addCard.appendChild(itemForm);
      addCard.appendChild(
        createButton("Tambah Item", "btn btn-secondary", () => {
          if (!clothingTypes.length) {
            messageBox.replaceChildren(
              createInfoBox("Tambahkan jenis pakaian terlebih dahulu untuk transaksi satuan.", "error"),
            );
            return;
          }
          const selectedId = itemForm.querySelector("#jenis-item").value;
          const selectedType = clothingTypes.find((item) => String(itemId(item)) === selectedId);
          const jumlah = Number(itemForm.querySelector("#jumlah-item").value || 0);
          if (!selectedType || jumlah < 1) {
            messageBox.replaceChildren(createInfoBox("Jenis pakaian dan jumlah item wajib valid.", "error"));
            return;
          }
          items.push({
            jenis_pakaian_id: itemId(selectedType),
            nama: itemName(selectedType),
            jumlah,
            harga: itemPrice(selectedType),
            subtotal: jumlah * itemPrice(selectedType),
          });
          messageBox.replaceChildren();
          renderDynamic();
        }),
      );

      const listCard = document.createElement("div");
      listCard.className = "card";
      listCard.innerHTML = `
        <h3 class="section-title">List Item</h3>
        <p class="section-subtitle">Item satuan yang akan masuk ke transaksi.</p>
      `;
      const list = document.createElement("div");
      list.className = "item-list";
      renderItems(list);
      listCard.appendChild(list);

      wrapper.append(addCard, listCard);
      dynamicArea.appendChild(wrapper);
    }

    const total = totalPrice({
      layanan,
      paket: form.elements.paket.value,
      beratKg: form.elements.berat_kg?.value,
      items,
    });
    totalBox.innerHTML = `
      <p class="summary-label">Total Harga</p>
      <p class="summary-value">${formatCurrency(total)}</p>
      <p class="section-subtitle">
        ${
          form.elements.paket.value === "express"
            ? `Sudah termasuk biaya express ${formatCurrency(EXPRESS_FEE)}.`
            : "Paket normal tanpa biaya tambahan."
        }
      </p>
    `;
  }

  form.addEventListener("change", renderDynamic);
  form.addEventListener("input", renderDynamic);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    messageBox.replaceChildren();

    const formData = new FormData(form);
    const layanan = String(formData.get("layanan") || "");
    const paket = String(formData.get("paket") || "");
    const nomorHp = String(formData.get("nomor_hp") || "").trim();
    const beratKg = Number(formData.get("berat_kg") || 0);

    if (!nomorHp) {
      messageBox.appendChild(createInfoBox("Nomor HP wajib diisi.", "error"));
      return;
    }
    if (layanan === "kiloan" && beratKg <= 0) {
      messageBox.appendChild(createInfoBox("Berat kiloan wajib diisi dan lebih dari 0.", "error"));
      return;
    }
    if (layanan === "satuan" && items.length < 1) {
      messageBox.appendChild(createInfoBox("Transaksi satuan wajib memiliki minimal 1 item.", "error"));
      return;
    }

    const payload = {
      nama_pelanggan: String(formData.get("nama_pelanggan") || "").trim(),
      nomor_hp: nomorHp,
      layanan,
      paket,
      berat_kg: layanan === "kiloan" ? beratKg : undefined,
      items: layanan === "satuan" ? items : [],
      total_harga: totalPrice({ layanan, paket, beratKg, items }),
    };

    submitButton.disabled = true;
    submitButton.textContent = "Menyimpan...";

    try {
      await createTransaction(payload);
      form.reset();
      items.splice(0, items.length);
      renderDynamic();
      messageBox.appendChild(createInfoBox("Transaksi berhasil disimpan."));
    } catch (error) {
      messageBox.appendChild(createInfoBox(error.message, "error"));
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Simpan Transaksi";
    }
  });

  renderDynamic();
  card.append(messageBox, form, dynamicArea, totalBox, actions);
  root.appendChild(card);
}
