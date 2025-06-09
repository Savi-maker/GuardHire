import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_URL = "http://192.168.0.19:3000";

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  token?: string;
}

// Pobierz token JWT z localStorage
export async function getToken(): Promise<string | null> {
  return await AsyncStorage.getItem('token');
}

// Zapisz token do localStorage
export async function setToken(token: string): Promise<void> {
  await AsyncStorage.setItem('token', token);
}

// Usuń token (wyloguj)
export async function removeToken(): Promise<void> {
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
}): Promise<ApiResponse> {
  try {
    const res = await fetch(`${API_URL}/profiles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const responseData = await res.json();
    return { success: true, data: responseData };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Wystąpił nieznany błąd' };
  }
}

// Logowanie użytkownika (otrzymujesz token)
export async function login(identifier: string, haslo: string): Promise<ApiResponse> {
  try {
    const res = await fetch(`${API_URL}/profiles/login`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ identifier, haslo })
    });
    
    const data = await res.json();
    
    // Jeśli mamy token w odpowiedzi, logowanie się powiodło
    if (data.token) {
      await setToken(data.token);
      return { success: true, token: data.token };
    }

    // Jeśli serwer zwrócił własny komunikat błędu, użyjmy go
    if (data.error) {
      return { success: false, error: data.error };
    }
    
    // Domyślny komunikat błędu
    return { 
      success: false, 
      error: 'Nieprawidłowy email lub hasło'
    };

  } catch (error) {
    return { 
      success: false, 
      error: 'Wystąpił problem z połączeniem. Spróbuj ponownie później.'
    };
  }
}


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
// Pobierz swój profil (po zalogowaniu, wymaga JWT)
export async function getMyProfile(): Promise<ProfileType> {
 try {
  const token = await getToken();
    if (!token) throw new Error('Brak tokenu autoryzacyjnego');
    const res = await fetch(`${API_URL}/profiles/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
      
    });

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  
    const data = await res.json();
    return data;
    } catch(error) {  throw error;}
}

// Pobierz wszystkie profile (lista użytkowników)
export async function getProfiles(): Promise<ApiResponse> {
  try {
    const res = await fetch(`${API_URL}/profiles`, {
      headers: { 'Accept': 'application/json' }
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    return { success: true, data };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Wystąpił nieznany błąd' };
  }
}

// Zmianna Roli użytkownika
export async function changeUserRole(id: number, role: string) {
  const token = await getToken();
  const res = await fetch(`${API_URL}/profiles/${id}/role`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': 'Bearer ' + token } : {}),
    },
    body: JSON.stringify({ role }),
  });
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
export async function addNotification(title: string, description: string, type: string = 'info') {
  const res = await fetch(`${API_URL}/notifications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description, type })
  });
  return res.json();
}

// Oznacz powiadomienie jako przeczytane
export async function markNotificationAsRead(id: number) {
  const res = await fetch(`${API_URL}/notifications/${id}/read`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' }
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