import AsyncStorage from '@react-native-async-storage/async-storage';

/* -------------------------------------------------- *
 *  CONFIG
 * -------------------------------------------------- */
export const API_URL = 'http://192.168.74.47:3000';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  token?: string;
}

/* -------------------------------------------------- *
 *  JWT helpers
 * -------------------------------------------------- */
export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem('token');
}
export async function setToken(token: string): Promise<void> {
  await AsyncStorage.setItem('token', token);
}
export async function removeToken(): Promise<void> {
  await AsyncStorage.removeItem('token');
}

/* -------------------------------------------------- *
 *  AUTH
 * -------------------------------------------------- */
export async function login(identifier: string, haslo: string): Promise<ApiResponse> {
  try {
    const res = await fetch(`${API_URL}/profiles/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ identifier, haslo }),
    });

    const data = await res.json();

    if (data.token) {
      await setToken(data.token);
      return { success: true, token: data.token };
    }
    return { success: false, error: data.error || 'Nieprawidłowy email lub hasło' };
  } catch {
    return { success: false, error: 'Wystąpił problem z połączeniem. Spróbuj ponownie później.' };
  }
}

/* -------------------------------------------------- *
 *  PROFILES
 * -------------------------------------------------- */
export type ProfileType = {
  id: number;
  imie: string;
  nazwisko: string;
  mail: string;
  username: string;
  numertelefonu: string;
  stanowisko: string;
  role: string;
};

export async function registerProfile(data: {
  imie: string;
  nazwisko: string;
  username: string;
  mail: string;
  numertelefonu: string;
  stanowisko: string;
  haslo: string;
}): Promise<ApiResponse> {
  try {
    const res = await fetch(`${API_URL}/profiles/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return { success: true, data: await res.json() };
  } catch (e: any) {
    return { success: false, error: e.message || 'Wystąpił nieznany błąd' };
  }
}

export async function getMyProfile(): Promise<ProfileType> {
  const token = await getToken();
  if (!token) throw new Error('Brak tokenu autoryzacyjnego');

  const res = await fetch(`${API_URL}/profiles/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);

  return res.json();
}

export async function getProfiles(): Promise<ApiResponse> {
  try {
    const res = await fetch(`${API_URL}/profiles`, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return { success: true, data: await res.json() };
  } catch (e: any) {
    return { success: false, error: e.message || 'Wystąpił nieznany błąd' };
  }
}

export async function changeUserRole(id: number, role: string) {
  const token = await getToken();
  const res = await fetch(`${API_URL}/profiles/${id}/role`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ role }),
  });
  return res.json();
}

/* -------------------------------------------------- *
 *  NEWS
 * -------------------------------------------------- */
export async function getNews() {
  return fetch(`${API_URL}/news`).then((r) => r.json());
}
export async function addNews(title: string, description: string) {
  const token = await getToken();
  const res = await fetch(`${API_URL}/news`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ title, description }),
  });
  return res.json();
}

/* -------------------------------------------------- *
 *  NOTIFICATIONS
 * -------------------------------------------------- */
export async function getNotifications() {
  return fetch(`${API_URL}/notifications`).then((r) => r.json());
}
export async function addNotification(title: string, description: string, type = 'info') {
  const res = await fetch(`${API_URL}/notifications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description, type }),
  });
  return res.json();
}
export async function markNotificationAsRead(id: number) {
  return fetch(`${API_URL}/notifications/${id}/read`, { method: 'PATCH' }).then((r) => r.json());
}

/* -------------------------------------------------- *
 *  ORDERS (zlecenia)
 * -------------------------------------------------- */
export async function getOrders() {
  return fetch(`${API_URL}/orders`).then((r) => r.json());
}
export async function addOrder(name: string, status: string, date: string) {
  const token = await getToken();
  const res = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ name, status, date }),
  });
  return res.json();
}
export async function getOrder(id: number) {
  return fetch(`${API_URL}/orders/${id}`).then((r) => r.json());
}
export async function updateOrder(id: number, data: { name: string; status: string; date: string }) {
  const token = await getToken();
  const res = await fetch(`${API_URL}/orders/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  return res.json();
}
export async function deleteOrder(id: number) {
  const token = await getToken();
  const res = await fetch(`${API_URL}/orders/${id}`, {
    method: 'DELETE',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return res.json();
}
export async function updateOrderStatus(orderId: string, status: string) {
  return fetch(`${API_URL}/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  }).then((r) => r.json());
}

/* -------------------------------------------------- *
 *  PAYMENTS
 * -------------------------------------------------- */
export async function getPaymentList() {
  return fetch(`${API_URL}/payment/list`).then((r) => r.json());
}
export async function manualCreatePayment(orderId: string) {
  return fetch(`${API_URL}/payment/manual-create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId }),
  }).then((r) => r.json());
}
export async function payPayment(paymentId: string, email: string) {
  return fetch(`${API_URL}/payment/pay`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paymentId, email }),
  });
}

/* -------------------------------------------------- *
 *  TASKS (do FormScreen)
 * -------------------------------------------------- */
export interface TaskPayload {
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  dueDate: string | null; // ISO
}

/**
 * Zapis zlecenia z ekranu formularza.
 * Używamy tego samego zasobu, co reszta modułu orders: POST /orders
 */
export async function createTask(payload: TaskPayload) {
  const token = await getToken();
  const res = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return res.json();
}
