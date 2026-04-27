CREATE DATABASE IF NOT EXISTS frezz_laundry;
USE frezz_laundry;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('owner', 'kasir') NOT NULL DEFAULT 'kasir',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pelanggan (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(150) NOT NULL,
  no_hp VARCHAR(25) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS jenis_pakaian (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama_jenis VARCHAR(150) NOT NULL,
  harga DECIMAL(12,2) NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS transaksi (
  id INT AUTO_INCREMENT PRIMARY KEY,
  kode_order VARCHAR(50) NOT NULL UNIQUE,
  pelanggan_id INT NOT NULL,
  layanan ENUM('kiloan', 'satuan') NOT NULL,
  paket ENUM('normal', 'express') NOT NULL DEFAULT 'normal',
  berat_kg DECIMAL(10,2) NULL,
  total_harga DECIMAL(12,2) NOT NULL DEFAULT 0,
  status ENUM('belum_selesai', 'siap_diambil', 'selesai') NOT NULL DEFAULT 'belum_selesai',
  tanggal_masuk DATETIME NOT NULL,
  tanggal_selesai DATETIME NULL,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_transaksi_pelanggan FOREIGN KEY (pelanggan_id) REFERENCES pelanggan(id),
  CONSTRAINT fk_transaksi_user FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS transaksi_detail (
  id INT AUTO_INCREMENT PRIMARY KEY,
  transaksi_id INT NOT NULL,
  jenis_id INT NOT NULL,
  qty INT NOT NULL,
  harga DECIMAL(12,2) NOT NULL,
  subtotal DECIMAL(12,2) NOT NULL,
  CONSTRAINT fk_detail_transaksi FOREIGN KEY (transaksi_id) REFERENCES transaksi(id) ON DELETE CASCADE,
  CONSTRAINT fk_detail_jenis FOREIGN KEY (jenis_id) REFERENCES jenis_pakaian(id)
);

CREATE TABLE IF NOT EXISTS riwayat (
  id INT AUTO_INCREMENT PRIMARY KEY,
  transaksi_id INT NOT NULL UNIQUE,
  selesai_at DATETIME NOT NULL,
  CONSTRAINT fk_riwayat_transaksi FOREIGN KEY (transaksi_id) REFERENCES transaksi(id) ON DELETE CASCADE
);

INSERT INTO users (username, password, role)
SELECT 'boss', '$2b$10$63WWnrdEH8nj8txN1WSh3e1TisGOVyiVYajWFIjiHR6IBmHejCE32', 'owner'
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'boss'
);

INSERT INTO jenis_pakaian (nama_jenis, harga)
SELECT 'Kemeja', 7000
WHERE NOT EXISTS (SELECT 1 FROM jenis_pakaian WHERE nama_jenis = 'Kemeja');

INSERT INTO jenis_pakaian (nama_jenis, harga)
SELECT 'Kaos', 5000
WHERE NOT EXISTS (SELECT 1 FROM jenis_pakaian WHERE nama_jenis = 'Kaos');

INSERT INTO jenis_pakaian (nama_jenis, harga)
SELECT 'Celana', 8000
WHERE NOT EXISTS (SELECT 1 FROM jenis_pakaian WHERE nama_jenis = 'Celana');

INSERT INTO jenis_pakaian (nama_jenis, harga)
SELECT 'Jas', 20000
WHERE NOT EXISTS (SELECT 1 FROM jenis_pakaian WHERE nama_jenis = 'Jas');

INSERT INTO jenis_pakaian (nama_jenis, harga)
SELECT 'Bed Cover', 25000
WHERE NOT EXISTS (SELECT 1 FROM jenis_pakaian WHERE nama_jenis = 'Bed Cover');
