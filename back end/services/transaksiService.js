const { pool } = require("../db");
const jenisModel = require("../models/jenisPakaianModel");
const pelangganModel = require("../models/pelangganModel");
const transaksiModel = require("../models/transaksiModel");
const { createWhatsAppLink, generateOrderCode } = require("../utils/helpers");

const HARGA_KILOAN = 10000;
const TAMBAHAN_EXPRESS = 10000;

class TransaksiService {
  validateTransaksi(body) {
    const nomor_hp = body.nomor_hp || body.no_hp;
    const { nama, layanan, paket, berat_kg, items } = body;

    if (!nama || !nomor_hp || !layanan || !paket) {
      throw new Error("Nama, nomor HP, layanan, dan paket wajib diisi.");
    }
    if (!["kiloan", "satuan"].includes(layanan)) {
      throw new Error("Layanan harus kiloan atau satuan.");
    }
    if (!["normal", "express"].includes(paket)) {
      throw new Error("Paket harus normal atau express.");
    }
    if (layanan === "kiloan" && (!berat_kg || Number(berat_kg) <= 0)) {
      throw new Error("Berat KG wajib diisi untuk layanan kiloan.");
    }
    if (layanan === "satuan") {
      if (berat_kg !== undefined && berat_kg !== null && Number(berat_kg) !== 0) {
        throw new Error("Berat KG harus kosong atau null untuk layanan satuan.");
      }
      if (!Array.isArray(items) || items.length === 0) {
        throw new Error("Item wajib diisi untuk layanan satuan.");
      }
    }
  }

  async getAllTransaksi() {
    return await transaksiModel.getAllActive();
  }

  async getLatestTransaksi(limit = 5) {
    return await transaksiModel.getLatest(limit);
  }

  async getTransaksiById(id) {
    const transaksi = await transaksiModel.findById(id);
    if (!transaksi) {
      throw new Error("Transaksi tidak ditemukan.");
    }
    const details = await transaksiModel.getDetailsByTransaksiId(id);
    return { ...transaksi, details };
  }

  async createTransaksi(data) {
    this.validateTransaksi(data);

    const {
      nama,
      nomor_hp,
      no_hp,
      alamat,
      layanan,
      paket,
      berat_kg,
      items = [],
    } = data;
    const noHp = nomor_hp || no_hp;

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      let pelanggan = await pelangganModel.findByPhone(noHp, connection);
      if (!pelanggan) {
        pelanggan = await pelangganModel.createPelanggan({ nama, noHp, alamat }, connection);
      }

      const transaksiId = await transaksiModel.createTransaksi(
        {
          kodeOrder: "TEMP",
          pelangganId: pelanggan.id,
          layanan,
          paket,
          beratKg: layanan === "kiloan" ? Number(berat_kg) : null,
          totalHarga: 0,
          status: "belum_selesai",
          tanggalMasuk: new Date(),
          tanggalSelesai: null,
        },
        connection
      );

      const kodeOrder = generateOrderCode(transaksiId);
      await transaksiModel.updateKodeOrder(transaksiId, kodeOrder, connection);

      let totalHarga = 0;

      if (layanan === "kiloan") {
        totalHarga = Number(berat_kg) * HARGA_KILOAN;
      } else {
        for (const item of items) {
          const jenisId = item.jenis_pakaian_id || item.jenis_id;
          const jumlah = Number(item.jumlah || item.qty || 0);
          const jenis = await jenisModel.findJenisById(jenisId, connection);
          if (!jenis) {
            throw new Error(`Jenis pakaian ID ${jenisId} tidak ditemukan.`);
          }
          if (jumlah <= 0) {
            throw new Error("Jumlah item harus lebih dari 0.");
          }
          const harga = Number(jenis.harga);
          const subtotal = jumlah * harga;
          totalHarga += subtotal;

          await transaksiModel.insertDetail(
            {
              transaksiId,
              jenisId: jenis.id,
              jumlah,
              subtotal,
            },
            connection
          );
        }
      }

      if (paket === "express") {
        totalHarga += TAMBAHAN_EXPRESS;
      }

      await transaksiModel.updateTransaksi(
        transaksiId,
        {
          beratKg: layanan === "kiloan" ? Number(berat_kg) : null,
          totalHarga,
          status: "belum_selesai",
          tanggalSelesai: null,
        },
        connection
      );

      await connection.commit();

      // Get full transaction details for WhatsApp
      const fullTransaksi = await transaksiModel.findById(transaksiId);
      
      // Create WhatsApp link for new order confirmation
      const whatsappLink = createWhatsAppLink(
        noHp,
        nama,
        kodeOrder,
        totalHarga,
        'new_order',
        {
          layanan,
          paket,
          tanggal_masuk: fullTransaksi.tanggal_masuk,
          tanggal_selesai: fullTransaksi.tanggal_selesai
        }
      );

      return {
        id: transaksiId,
        kode_order: kodeOrder,
        total_harga: totalHarga,
        nama_pelanggan: nama,
        nomor_hp: noHp,
        layanan,
        paket,
        whatsapp_link: whatsappLink,
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async updateStatus(id, status) {
    if (!["belum_selesai", "siap_diambil", "selesai"].includes(status)) {
      throw new Error("Status tidak valid.");
    }

    const transaksi = await transaksiModel.findById(id);
    if (!transaksi) {
      throw new Error("Transaksi tidak ditemukan.");
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const tanggalSelesai = status === "selesai" ? new Date() : transaksi.tanggal_selesai;
      await transaksiModel.updateStatus(id, status, tanggalSelesai, connection);

      if (status === "selesai") {
        await transaksiModel.upsertRiwayat(id, new Date(), connection);
      }

      await connection.commit();

      const updated = await transaksiModel.findById(id);
      const responseData = { ...updated };

      if (status === "siap_diambil") {
        responseData.whatsapp_link = createWhatsAppLink(
          updated.nomor_hp,
          updated.nama_pelanggan,
          updated.kode_order,
          updated.total_harga
        );
      }

      return responseData;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = new TransaksiService();
