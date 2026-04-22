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

async function loadJenis() {
  const response = await apiRequest("/api/jenis");
  const tbody = document.getElementById("jenisTableBody");
  tbody.innerHTML = "";

  if (!response.data.length) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 3;
    cell.appendChild(createEmptyState("Belum ada master jenis pakaian."));
    row.appendChild(cell);
    tbody.appendChild(row);
    return;
  }

  response.data.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.nama_jenis}</td>
      <td>${formatCurrency(item.harga)}</td>
      <td>
        <div class="button-row">
          <button class="button button-ghost small-button" data-edit="${item.id}">Edit</button>
          <button class="button button-danger small-button" data-delete="${item.id}">Hapus</button>
        </div>
      </td>
    `;
    tbody.appendChild(row);

    row.querySelector("[data-edit]").addEventListener("click", () => {
      document.getElementById("jenisId").value = item.id;
      document.getElementById("namaJenis").value = item.nama_jenis;
      document.getElementById("hargaJenis").value = item.harga;
    });

    row.querySelector("[data-delete]").addEventListener("click", async () => {
      if (!window.confirm(`Hapus jenis ${item.nama_jenis}?`)) return;
      try {
        await apiRequest(`/api/jenis/${item.id}`, { method: "DELETE" });
        setMessage(document.getElementById("messageBox"), "Jenis pakaian berhasil dihapus.", "success");
        await loadJenis();
      } catch (error) {
        setMessage(document.getElementById("messageBox"), error.message, "error");
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    guardPage({ ownerOnly: true });
    mountSidebar("master-jenis");
    mountPageHeader("Master Jenis", "Kelola nama jenis pakaian dan harga satuannya.");

    document.getElementById("resetJenisButton").addEventListener("click", () => {
      document.getElementById("jenisForm").reset();
      document.getElementById("jenisId").value = "";
    });

    document.getElementById("jenisForm").addEventListener("submit", async (event) => {
      event.preventDefault();
      const button = document.getElementById("saveJenisButton");
      setButtonLoading(button, true, "Simpan");

      try {
        const id = document.getElementById("jenisId").value;
        const payload = {
          nama_jenis: document.getElementById("namaJenis").value.trim(),
          harga: Number(document.getElementById("hargaJenis").value || 0),
        };

        if (id) {
          await apiRequest(`/api/jenis/${id}`, { method: "PUT", body: payload });
          setMessage(document.getElementById("messageBox"), "Jenis pakaian berhasil diperbarui.", "success");
        } else {
          await apiRequest("/api/jenis", { method: "POST", body: payload });
          setMessage(document.getElementById("messageBox"), "Jenis pakaian berhasil ditambahkan.", "success");
        }

        document.getElementById("jenisForm").reset();
        document.getElementById("jenisId").value = "";
        await loadJenis();
      } catch (error) {
        setMessage(document.getElementById("messageBox"), error.message, "error");
      } finally {
        setButtonLoading(button, false, "Simpan");
      }
    });

    await loadJenis();
  } catch (error) {
    setMessage(document.getElementById("messageBox"), error.message, "error");
  }
});
