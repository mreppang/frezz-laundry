import { createButton, createInfoBox, createSectionHeader } from "../components/ui.js";
import { createAccount } from "../services/api.js";

export async function renderCreateAccountPage(root) {
  root.innerHTML = "";

  const card = document.createElement("section");
  card.className = "card";
  card.appendChild(
    createSectionHeader("Buat Akun Baru", "Halaman ini hanya untuk owner dalam menambahkan akun sistem."),
  );

  const messageBox = document.createElement("div");
  const form = document.createElement("form");
  form.className = "form-grid";
  form.innerHTML = `
    <div class="form-grid cols-2">
      <div class="field">
        <label for="nama-akun">Nama</label>
        <input class="input" id="nama-akun" name="nama" placeholder="Nama lengkap pengguna" required />
      </div>
      <div class="field">
        <label for="username-akun">Username</label>
        <input class="input" id="username-akun" name="username" placeholder="Username login" required />
      </div>
    </div>
    <div class="form-grid cols-2">
      <div class="field">
        <label for="password-akun">Password</label>
        <input class="input" id="password-akun" name="password" type="password" placeholder="Masukkan password" required />
      </div>
      <div class="field">
        <label for="role-akun">Role</label>
        <select class="select" id="role-akun" name="role">
          <option value="kasir">Kasir</option>
          <option value="owner">Owner</option>
        </select>
      </div>
    </div>
  `;

  const submitButton = createButton("Simpan Akun", "btn btn-primary", null, "submit");
  form.appendChild(submitButton);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    messageBox.replaceChildren();
    submitButton.disabled = true;
    submitButton.textContent = "Menyimpan...";

    try {
      const formData = new FormData(form);
      await createAccount({
        nama: String(formData.get("nama") || "").trim(),
        username: String(formData.get("username") || "").trim(),
        password: String(formData.get("password") || "").trim(),
        role: String(formData.get("role") || "kasir"),
      });
      form.reset();
      messageBox.appendChild(createInfoBox("Akun baru berhasil dibuat."));
    } catch (error) {
      messageBox.appendChild(createInfoBox(error.message, "error"));
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Simpan Akun";
    }
  });

  card.append(messageBox, form);
  root.appendChild(card);
}
