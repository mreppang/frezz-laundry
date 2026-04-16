import { createButton, createEmptyState, createInfoBox, createSectionHeader, formatCurrency } from "../components/ui.js";
import {
  createClothingType,
  deleteClothingType,
  fetchClothingTypes,
  updateClothingType,
} from "../services/api.js";

function itemId(item) {
  return item.id || item._id;
}

function itemName(item) {
  return item.nama || item.nama_jenis || item.name || "";
}

function itemPrice(item) {
  return Number(item.harga || item.price || item.tarif || 0);
}

export async function renderClothingTypesPage(root) {
  root.innerHTML = "";
  root.appendChild(createInfoBox("Memuat master jenis pakaian...", "loading"));

  async function load() {
    try {
      const items = await fetchClothingTypes();
      root.innerHTML = "";

      const wrapper = document.createElement("section");
      wrapper.className = "card-grid cols-2";

      const formCard = document.createElement("article");
      formCard.className = "card";
      formCard.appendChild(
        createSectionHeader("Tambah Jenis Pakaian", "Masukkan item satuan beserta harga per item."),
      );
      const formMessage = document.createElement("div");
      const form = document.createElement("form");
      form.className = "form-grid";
      form.innerHTML = `
        <div class="field">
          <label for="nama-jenis">Nama Jenis Pakaian</label>
          <input class="input" id="nama-jenis" name="nama" placeholder="Contoh: Jas, Selimut, Kaos" required />
        </div>
        <div class="field">
          <label for="harga-jenis">Harga</label>
          <input class="input" id="harga-jenis" name="harga" type="number" min="0" placeholder="Contoh: 15000" required />
        </div>
      `;
      const submitButton = createButton("Tambah Jenis", "btn btn-primary", null, "submit");
      form.appendChild(submitButton);
      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        formMessage.replaceChildren();
        submitButton.disabled = true;
        submitButton.textContent = "Menyimpan...";
        try {
          const formData = new FormData(form);
          await createClothingType({
            nama: String(formData.get("nama") || "").trim(),
            harga: Number(formData.get("harga") || 0),
          });
          form.reset();
          await load();
        } catch (error) {
          formMessage.appendChild(createInfoBox(error.message, "error"));
        } finally {
          submitButton.disabled = false;
          submitButton.textContent = "Tambah Jenis";
        }
      });
      formCard.append(formMessage, form);

      const listCard = document.createElement("article");
      listCard.className = "card";
      listCard.appendChild(
        createSectionHeader("Daftar Jenis Pakaian", "Edit atau hapus item yang dipakai pada layanan satuan."),
      );
      const list = document.createElement("div");
      list.className = "item-list";
      if (!items.length) {
        list.appendChild(createEmptyState("Belum ada jenis pakaian yang ditambahkan."));
      } else {
        items.forEach((item) => {
          const row = document.createElement("div");
          row.className = "item-row";
          row.innerHTML = `
            <div>
              <strong>${itemName(item)}</strong>
              <p class="section-subtitle">${formatCurrency(itemPrice(item))}</p>
            </div>
          `;
          const actions = document.createElement("div");
          actions.className = "actions-row";
          actions.append(
            createButton("Edit", "btn btn-secondary", async () => {
              const nama = prompt("Ubah nama jenis pakaian:", itemName(item));
              if (nama === null) {
                return;
              }
              const harga = prompt("Ubah harga:", String(itemPrice(item)));
              if (harga === null) {
                return;
              }
              try {
                await updateClothingType(item, { nama: nama.trim(), harga: Number(harga) });
                await load();
              } catch (error) {
                alert(error.message);
              }
            }),
            createButton("Hapus", "btn btn-danger", async () => {
              if (!window.confirm(`Hapus jenis pakaian "${itemName(item)}"?`)) {
                return;
              }
              try {
                await deleteClothingType(item);
                await load();
              } catch (error) {
                alert(error.message);
              }
            }),
          );
          row.appendChild(actions);
          list.appendChild(row);
        });
      }
      listCard.appendChild(list);

      wrapper.append(formCard, listCard);
      root.appendChild(wrapper);
    } catch (error) {
      root.innerHTML = "";
      root.appendChild(createInfoBox(error.message, "error"));
    }
  }

  await load();
}
