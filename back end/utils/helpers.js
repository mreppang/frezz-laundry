function formatCurrency(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(date) {
  return new Date(date).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function generateOrderCode(id) {
  return `FRZ-${String(id).padStart(3, "0")}`;
}

function createWhatsAppLink(phone, name, orderCode, total, messageType = 'ready', extraData = {}) {
  const formattedPhone = phone.replace(/^0/, "62").replace(/[^0-9]/g, "");
  let message = "";

  if (messageType === 'new_order') {
    // Message for new order confirmation
    const layanan = extraData.layanan || 'kiloan';
    const paket = extraData.paket || 'normal';
    const tanggalMasuk = extraData.tanggal_masuk ? formatDate(extraData.tanggal_masuk) : formatDate(new Date());
    const estimasiHari = paket === 'express' ? 1 : 3;
    const estimasiSelesai = new Date();
    estimasiSelesai.setDate(estimasiSelesai.getDate() + estimasiHari);
    
    message = `Halo ${name},

Pesanan laundry Anda telah diterima! ✅

📋 *Detail Pesanan:*
Kode Order: *${orderCode}*
Layanan: ${layanan === 'kiloan' ? '🧺 Kiloan' : '👕 Satuan'}
Paket: ${paket === 'express' ? '🚀 Express (1 hari)' : '⏰ Normal (3 hari)'}
Tanggal Masuk: ${tanggalMasuk}
Estimasi Selesai: ${formatDate(estimasiSelesai)}
Total: *${formatCurrency(total)}*

Terima kasih telah menggunakan FREZZ LAUNDRY! 🧼✨`;
  } else {
    // Message for order ready (existing)
    message = `Halo ${name},

Pesanan laundry Anda dengan kode *${orderCode}* sudah selesai dan siap diambil! 🎉

Total pembayaran: *${formatCurrency(total)}*

Silakan diambil di FREZZ LAUNDRY.
Terima kasih! 🧼✨`;
  }
  
  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePhone(phone) {
  const phoneRegex = /^08[0-9]{9,12}$/;
  return phoneRegex.test(phone);
}

module.exports = {
  formatCurrency,
  formatDate,
  generateOrderCode,
  createWhatsAppLink,
  validateEmail,
  validatePhone,
};
