export function formatCurrency(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export function formatDate(value) {
  if (!value) {
    return "-";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function humanizeStatus(status) {
  return String(status || "belum_selesai").replaceAll("_", " ");
}

export function getStatusBadgeClass(status) {
  if (status === "selesai") {
    return "badge badge-success";
  }
  if (status === "siap_diambil") {
    return "badge badge-info";
  }
  return "badge badge-warning";
}

export function createInfoBox(message, type = "info") {
  const box = document.createElement("div");
  box.className =
    type === "error"
      ? "error-box"
      : type === "loading"
        ? "loading-box"
        : "info-box";
  box.textContent = message;
  return box;
}

export function createEmptyState(message) {
  const box = document.createElement("div");
  box.className = "empty-state";
  box.textContent = message;
  return box;
}

export function createSectionHeader(title, subtitle = "") {
  const header = document.createElement("div");
  header.innerHTML = `
    <h3 class="section-title">${title}</h3>
    ${subtitle ? `<p class="section-subtitle">${subtitle}</p>` : ""}
  `;
  return header;
}

export function createButton(label, className = "btn btn-secondary", onClick, type = "button") {
  const button = document.createElement("button");
  button.type = type;
  button.className = className;
  button.textContent = label;
  if (onClick) {
    button.addEventListener("click", onClick);
  }
  return button;
}
