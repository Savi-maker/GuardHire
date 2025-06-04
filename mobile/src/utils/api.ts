import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = "http://192.168.1.111:3000";

// Pobierz token JWT z localStorage
export async function getToken(): Promise<string | null> {
  return await AsyncStorage.getItem('token');
}

// Zapisz token do localStorage
export async function setToken(token: string) {
  await AsyncStorage.setItem('token', token);
}

// Usuń token (wyloguj)
export async function removeToken() {
  await AsyncStorage.removeItem('token');
}











// ---------- PROFILE ----------

// Rejestracja nowego użytkownika
export async function registerProfile(data: {
  imie: string;
  nazwisko: string;
  username: string;        
  mail: string;
  numertelefonu: string;
  stanowisko: string;
  haslo: string;
}) {
  const res = await fetch(`${API_URL}/profiles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

// Logowanie użytkownika (otrzymujesz token)
export async function login(identifier: string, haslo: string) {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, haslo })
  });
  const data = await res.json();
  if (data.token) setToken(data.token);
  return data;
}

// Pobierz swój profil (po zalogowaniu, wymaga JWT)
export async function getMyProfile() {
  const token = await getToken();
  const res = await fetch(`${API_URL}/me`, {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  if (res.status === 401) throw new Error('Unauthorized');
  return res.json();
}

// Pobierz wszystkie profile (lista użytkowników)
export async function getProfiles() {
  const res = await fetch(`${API_URL}/profiles`);
  return res.json();
}












// ---------- NEWS ----------

// Pobierz newsy
export async function getNews() {
  const res = await fetch(`${API_URL}/news`);
  return res.json();
}

// Dodaj news
export async function addNews(title: string, description: string) {
  const token = await getToken();
  const res = await fetch(`${API_URL}/news`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': 'Bearer ' + token } : {})
    },
    body: JSON.stringify({ title, description })
  });
  return res.json();
}












// ---------- NOTIFICATIONS ----------

// Pobierz powiadomienia
export async function getNotifications() {
  const res = await fetch(`${API_URL}/notifications`);
  return res.json();
}

// Dodaj powiadomienie
export async function addNotification(title: string, description: string) {
  const token = await getToken();
  const res = await fetch(`${API_URL}/notifications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': 'Bearer ' + token } : {})
    },
    body: JSON.stringify({ title, description })
  });
  return res.json();
}













// ---------- zlecenia ----------
 // Pobierz wszystkie zlecenia
export async function getOrders() {
  const res = await fetch(`${API_URL}/orders`);
  return res.json();
}

// Dodaj zlecenie
export async function addOrder(name: string, status: string, date: string) {
  const token = await getToken(); 
  const res = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': 'Bearer ' + token } : {})
    },
    body: JSON.stringify({ name, status, date })
  });
  return res.json();
}
// Pobierz jedno zlecenie po ID
export async function getOrder(id: number) {
  const res = await fetch(`${API_URL}/orders/${id}`);
  return res.json();
}

// Edytuj zlecenie po ID
export async function updateOrder(id: number, data: { name: string; status: string; date: string }) {
  const token = await getToken();
  const res = await fetch(`${API_URL}/orders/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': 'Bearer ' + token } : {})
    },
    body: JSON.stringify(data)
  });
  return res.json();
}

// Usuń zlecenie po ID
export async function deleteOrder(id: number) {
  const token = await getToken();
  const res = await fetch(`${API_URL}/orders/${id}`, {
    method: 'DELETE',
    headers: {
      ...(token ? { 'Authorization': 'Bearer ' + token } : {})
    }
  });
  return res.json();
}