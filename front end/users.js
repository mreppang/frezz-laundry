import {
  apiRequest,
  createEmptyState,
  formatDate,
  getUsername,
  guardPage,
  mountPageHeader,
  mountSidebar,
  setButtonLoading,
  setMessage,
} from "./shared.js";

async function loadUsers() {
  const response = await apiRequest("/api/users");
  const tbody = document.getElementById("usersTableBody");
  tbody.innerHTML = "";

  if (!response.data.length) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 4;
    cell.appendChild(createEmptyState("Belum ada user di sistem."));
    row.appendChild(cell);
    tbody.appendChild(row);
    return;
  }

  response.data.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.username}</td>
      <td>${item.role}</td>
      <td>${formatDate(item.created_at)}</td>
      <td>
        <div class="button-row">
          <button class="button button-ghost small-button" data-edit="${item.id}">Edit</button>
          ${
            item.username !== getUsername()
              ? `<button class="button button-danger small-button" data-delete="${item.id}">Hapus</button>`
              : ""
          }
        </div>
      </td>
    `;
    tbody.appendChild(row);

    row.querySelector("[data-edit]").addEventListener("click", () => {
      document.getElementById("userId").value = item.id;
      document.getElementById("userUsername").value = item.username;
      document.getElementById("userRole").value = item.role;
      document.getElementById("userPassword").value = "";
    });

    const deleteButton = row.querySelector("[data-delete]");
    if (deleteButton) {
      deleteButton.addEventListener("click", async () => {
        if (!window.confirm(`Hapus user ${item.username}?`)) return;
        try {
          await apiRequest(`/api/users/${item.id}`, { method: "DELETE" });
          setMessage(document.getElementById("messageBox"), "User berhasil dihapus.", "success");
          await loadUsers();
        } catch (error) {
          setMessage(document.getElementById("messageBox"), error.message, "error");
        }
      });
    }
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    guardPage({ ownerOnly: true });
    mountSidebar("users");
    mountPageHeader("Users", "Kelola akun kasir dan owner yang bisa login ke sistem.");

    document.getElementById("resetUserButton").addEventListener("click", () => {
      document.getElementById("userForm").reset();
      document.getElementById("userId").value = "";
      document.getElementById("userRole").value = "kasir";
    });

    document.getElementById("userForm").addEventListener("submit", async (event) => {
      event.preventDefault();
      const button = document.getElementById("saveUserButton");
      setButtonLoading(button, true, "Simpan");

      try {
        const id = document.getElementById("userId").value;
        const payload = {
          username: document.getElementById("userUsername").value.trim(),
          password: document.getElementById("userPassword").value.trim(),
          role: document.getElementById("userRole").value,
        };

        if (id) {
          await apiRequest(`/api/users/${id}`, { method: "PUT", body: payload });
          setMessage(document.getElementById("messageBox"), "User berhasil diperbarui.", "success");
        } else {
          await apiRequest("/api/users", { method: "POST", body: payload });
          setMessage(document.getElementById("messageBox"), "User berhasil ditambahkan.", "success");
        }

        document.getElementById("userForm").reset();
        document.getElementById("userId").value = "";
        document.getElementById("userRole").value = "kasir";
        await loadUsers();
      } catch (error) {
        setMessage(document.getElementById("messageBox"), error.message, "error");
      } finally {
        setButtonLoading(button, false, "Simpan");
      }
    });

    await loadUsers();
  } catch (error) {
    setMessage(document.getElementById("messageBox"), error.message, "error");
  }
});
