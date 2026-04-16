import { clearAuth, getApiBaseUrl, getToken, saveAuth } from "./auth.js";

function extractPayload(data) {
  if (Array.isArray(data)) {
    return data;
  }
  return data?.data || data?.results || data;
}

function extractToken(data) {
  return data?.token || data?.accessToken || data?.jwt || "";
}

function parseJwtPayload(token) {
  try {
    const [, payload] = String(token || "").split(".");
    if (!payload) {
      return null;
    }
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(normalized));
  } catch {
    return null;
  }
}

function extractUser(data, username, token) {
  const jwtUser = parseJwtPayload(token);
  return (
    data?.user ||
    data?.data?.user ||
    data?.akun || {
      username,
      role: data?.role || jwtUser?.role || jwtUser?.jabatan || "kasir",
      nama: data?.nama || jwtUser?.nama || jwtUser?.name || username,
    }
  );
}

async function request(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const token = getToken();
  if (token && options.auth !== false) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, { ...options, headers });
  const text = await response.text();
  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (!response.ok) {
    if (response.status === 401) {
      clearAuth();
    }
    throw new Error(data?.message || `Request gagal dengan status ${response.status}`);
  }

  return data;
}

async function withFallback(requests) {
  let lastError = null;
  for (const makeRequest of requests) {
    try {
      return await makeRequest();
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error("Permintaan backend gagal.");
}

export async function login(payload) {
  const data = await request("/login", {
    method: "POST",
    auth: false,
    body: JSON.stringify(payload),
  });

  const token = extractToken(data);
  const auth = {
    token,
    user: extractUser(data, payload.username, token),
  };

  if (!auth.token) {
    throw new Error("Token JWT tidak ditemukan di respons login.");
  }

  saveAuth(auth);
  return auth;
}

export async function fetchTransactions() {
  const data = await withFallback([() => request("/transaksi"), () => request("/transactions")]);
  return extractPayload(data) || [];
}

export async function createTransaction(payload) {
  return request("/transaksi", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateTransactionStatus(transaction, nextStatus) {
  const id = transaction.id || transaction._id || transaction.kode_order;
  const body = JSON.stringify({ status: nextStatus });
  return withFallback([
    () => request(`/transaksi/${id}/status`, { method: "PATCH", body }),
    () => request(`/transaksi/${id}`, { method: "PATCH", body }),
    () =>
      request(`/transaksi/${id}`, {
        method: "PUT",
        body: JSON.stringify({ ...transaction, status: nextStatus }),
      }),
  ]);
}

export async function fetchClothingTypes() {
  const data = await withFallback([
    () => request("/jenis-pakaian"),
    () => request("/jenis_pakaian"),
    () => request("/clothing-types"),
  ]);
  return extractPayload(data) || [];
}

export async function createClothingType(payload) {
  return withFallback([
    () => request("/jenis-pakaian", { method: "POST", body: JSON.stringify(payload) }),
    () => request("/jenis_pakaian", { method: "POST", body: JSON.stringify(payload) }),
  ]);
}

export async function updateClothingType(item, payload) {
  const id = item.id || item._id;
  return withFallback([
    () => request(`/jenis-pakaian/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
    () => request(`/jenis_pakaian/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  ]);
}

export async function deleteClothingType(item) {
  const id = item.id || item._id;
  return withFallback([
    () => request(`/jenis-pakaian/${id}`, { method: "DELETE" }),
    () => request(`/jenis_pakaian/${id}`, { method: "DELETE" }),
  ]);
}

export async function createAccount(payload) {
  return withFallback([
    () => request("/users", { method: "POST", body: JSON.stringify(payload) }),
    () => request("/akun", { method: "POST", body: JSON.stringify(payload) }),
    () => request("/register", { method: "POST", body: JSON.stringify(payload) }),
  ]);
}
