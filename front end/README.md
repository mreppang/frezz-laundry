# Laundry POS Frontend

Frontend aplikasi laundry berbasis web dengan HTML, CSS, dan JavaScript modular.

## Fitur

- Login dengan `POST /login`
- Simpan JWT ke `localStorage`
- Dashboard owner dan kasir
- Transaksi baru dengan total otomatis
- Daftar cucian dan update status
- Riwayat transaksi selesai
- Master jenis pakaian untuk owner
- Buat akun untuk owner

## Cara pakai

1. Pastikan backend Express.js berjalan.
2. Buka `index.html` di browser atau serve folder ini sebagai static frontend.
3. Isi `API Base URL` pada halaman login, misalnya `http://localhost:3000`.

## Catatan endpoint

Frontend ini memakai endpoint utama berikut:

- `POST /login`
- `GET /transaksi`
- `POST /transaksi`
- `PATCH /transaksi/:id/status` atau fallback `PATCH /transaksi/:id`
- `GET/POST/PUT/DELETE /jenis-pakaian`
- `POST /users` atau fallback `/akun` atau `/register`

Jika nama endpoint backend Anda sedikit berbeda, sesuaikan di `services/api.js`.
