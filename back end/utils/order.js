function generateOrderCode(id) {
  return `FRZ-${String(id).padStart(3, "0")}`;
}

function normalizeWhatsAppNumber(phoneNumber) {
  let digits = String(phoneNumber || "").replace(/\D/g, "");
  if (digits.startsWith("0")) {
    digits = `62${digits.slice(1)}`;
  }
  return digits;
}

function createWhatsAppLink(phoneNumber, nama, kodeOrder, totalHarga) {
  const cleanedPhone = normalizeWhatsAppNumber(phoneNumber);
  const formattedTotal = Number(totalHarga || 0).toLocaleString("id-ID");
  const message = `Halo ${nama}, cucian anda dengan kode ${kodeOrder} sudah selesai dan siap diambil. Total pembayaran Rp ${formattedTotal}`;
  return `https://wa.me/${cleanedPhone}?text=${encodeURIComponent(message)}`;
}

module.exports = {
  generateOrderCode,
  normalizeWhatsAppNumber,
  createWhatsAppLink,
};
