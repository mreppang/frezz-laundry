const STORAGE_KEY = "laundry_auth";
const API_BASE_KEY = "laundry_api_base_url";

export function getAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveAuth(auth) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
}

export function clearAuth() {
  localStorage.removeItem(STORAGE_KEY);
}

export function getToken() {
  return getAuth()?.token || "";
}

export function getApiBaseUrl() {
  return localStorage.getItem(API_BASE_KEY) || "http://localhost:3000";
}

export function setApiBaseUrl(url) {
  localStorage.setItem(API_BASE_KEY, url);
}
