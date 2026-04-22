# FREZZ LAUNDRY WEB APP - Backend

Backend REST API untuk aplikasi laundry berbasis Express.js, MySQL, JWT, dan bcrypt.

## Stack

- Node.js
- Express.js
- MySQL (`mysql2/promise`)
- JWT Authentication
- bcrypt password hash

## Struktur

- `server.js`
- `db.js`
- `config/`
- `controllers/`
- `middleware/`
- `models/`
- `routes/`
- `utils/`
- `database.sql`

## Environment

Gunakan `.env` berikut:

```env
PORT=3000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=Frezz_laundry
JWT_SECRET=change-this-secret
JWT_EXPIRES_IN=1d
CORS_ORIGIN=*
```

## API Utama

- `POST /api/login`
- `GET /api/dashboard/stats`
- `GET /api/jenis`
- `POST /api/jenis`
- `PUT /api/jenis/:id`
- `DELETE /api/jenis/:id`
- `GET /api/users`
- `POST /api/users`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`
- `GET /api/transaksi`
- `GET /api/transaksi/latest`
- `GET /api/transaksi/:id`
- `POST /api/transaksi`
- `PATCH /api/transaksi/:id/status`
- `GET /api/riwayat`
