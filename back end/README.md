# Laundry Management API

REST API backend untuk sistem laundry menggunakan Express.js dan MySQL (XAMPP).

## Fitur utama

- Login dengan JWT
- Middleware autentikasi dan otorisasi role
- Transaksi laundry kiloan dan satuan
- Riwayat transaksi selesai
- Update status dengan link WhatsApp saat siap diambil
- Master jenis pakaian
- Pembuatan akun owner/kasir oleh owner

## Struktur

- `server.js`
- `db.js`
- `config/`
- `controllers/`
- `middleware/`
- `models/`
- `routes/`
- `utils/`

## Cara menjalankan

1. Pastikan MySQL XAMPP aktif dan database `Frezz_laundry` beserta tabel existing sudah tersedia.
2. Sesuaikan environment variable sesuai `.env` atau `.env.example`.
3. Jalankan server:

```bash
npm start
```

Server default berjalan di `http://localhost:3000`.

Konfigurasi bawaan project ini sudah diarahkan ke:

- host `127.0.0.1`
- port `3306`
- user `root`
- database `Frezz_laundry`

## Endpoint utama

### Auth

- `POST /login`

### Users

- `POST /users`

### Transaksi

- `POST /transaksi`
- `GET /transaksi`
- `GET /riwayat`
- `PATCH /transaksi/:id/status`
- `POST /transaksi/:id/detail`

### Jenis pakaian

- `GET /jenis`
- `POST /jenis`
- `PUT /jenis/:id`
- `DELETE /jenis/:id`

## Catatan password

API login mendukung password plain text maupun password hash `scrypt`.
User yang dibuat lewat endpoint `POST /users` akan disimpan dengan hash `scrypt`.
