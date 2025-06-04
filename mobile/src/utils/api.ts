import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = "http://192.168.0.130:3000";

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

// Logowanie użytkownika
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

// Pobierz swój profil
export async function getMyProfile(): Promise<ApiResponse> {
  try {
    const token = await getToken();
    if (!token) {
      throw new Error('Brak tokenu autoryzacyjnego');
    }

    const res = await fetch(`${API_URL}/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
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

// Pobierz wszystkie profile
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

// ---------- NEWS ----------

// Pobierz newsy
export async function getNews(): Promise<ApiResponse> {
  try {
    const res = await fetch(`${API_URL}/news`, {
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

// Dodaj news
export async function addNews(title: string, description: string): Promise<ApiResponse> {
  try {
    const token = await getToken();
    const res = await fetch(`${API_URL}/news`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ title, description })
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

// ---------- NOTIFICATIONS ----------

// Pobierz powiadomienia
export async function getNotifications(): Promise<ApiResponse> {
  try {
    const res = await fetch(`${API_URL}/notifications`, {
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

// Dodaj powiadomienie
export async function addNotification(title: string, description: string): Promise<ApiResponse> {
  try {
    const token = await getToken();
    const res = await fetch(`${API_URL}/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ title, description })
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

// ---------- ZLECENIA ----------

// Pobierz wszystkie zlecenia
export async function getOrders(): Promise<ApiResponse> {
  try {
    const res = await fetch(`${API_URL}/orders`, {
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

// Dodaj zlecenie
export async function addOrder(name: string, status: string, date: string): Promise<ApiResponse> {
  try {
    const token = await getToken();
    const res = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ name, status, date })
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

// Pobierz jedno zlecenie po ID
export async function getOrder(id: number): Promise<ApiResponse> {
  try {
    const res = await fetch(`${API_URL}/orders/${id}`, {
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

// Edytuj zlecenie po ID
export async function updateOrder(id: number, data: { name: string; status: string; date: string }): Promise<ApiResponse> {
  try {
    const token = await getToken();
    const res = await fetch(`${API_URL}/orders/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
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

// Usuń zlecenie po ID
export async function deleteOrder(id: number): Promise<ApiResponse> {
  try {
    const token = await getToken();
    const res = await fetch(`${API_URL}/orders/${id}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
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