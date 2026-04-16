function generateOrderCode(id) {
  return `FRZ-${String(id).padStart(3, "0")}`;
}

function createWhatsAppLink(nomorHp, nama, kodeOrder) {
  const cleanedPhone = String(nomorHp || "").replace(/\D/g, "");
  const message = `Halo ${nama}, laundry kamu sudah siap diambil. No Order: ${kodeOrder}`;
  return `https://wa.me/${cleanedPhone}?text=${encodeURIComponent(message)}`;
}

module.exports = {
  generateOrderCode,
  createWhatsAppLink,
};
