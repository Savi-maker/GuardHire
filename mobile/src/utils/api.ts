import AsyncStorage from '@react-native-async-storage/async-storage';


export const API_URL = "http://192.168.1.111:3000";



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

    if (data.token) {
      // Token jest automatycznie zapisywany w localStorage
      await setToken(data.token);
      return { success: true, token: data.token };
    }

    if (data.error) {
      return { success: false, error: data.error };
    }

    return { success: false, error: 'Nieprawidłowy email lub hasło' };

  } catch (error) {
    return { success: false, error: 'Wystąpił problem z połączeniem. Spróbuj ponownie później.' };
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
    const res = await fetch(`${API_URL}/auth/register`, {
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

// Resetowanie hasła

export async function resetPassword(data: {
  mail: string;
  imie: string;
  nazwisko: string;
  newPassword: string;
}): Promise<ApiResponse> {
  try {
    // Najpierw sprawdzamy czy dane się zgadzają
    const verifyResponse = await fetch(`${API_URL}/auth/verify-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mail: data.mail,
        imie: data.imie,
        nazwisko: data.nazwisko
      }),
    });

    const verifyData = await verifyResponse.json();

    if (!verifyResponse.ok || !verifyData.exists) {
      return {
        success: false,
        error: verifyData.message ?? 'Podane dane są nieprawidłowe lub użytkownik nie istnieje'
      };
    }

    // Jeśli weryfikacja się powiodła, resetujemy hasło
    const resetResponse = await fetch(`${API_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const resetData = await resetResponse.json();

    if (!resetResponse.ok) {
      return {
        success: false,
        error: resetData.message ?? 'Wystąpił błąd podczas resetowania hasła'
      };
    }

    return {
      success: true,
      data: resetData
    };

  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Wystąpił nieznany błąd' };
  }
}

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
  } catch (error) {
    throw error;
  }
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

// Zmiana roli użytkownika
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

// Pobierz listę ochroniarzy
export async function getGuards(): Promise<ApiResponse<ProfileType[]>> {
  try {
    const res = await fetch(`${API_URL}/profiles/guards`, {
      headers: { 'Accept': 'application/json' }
    });

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

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

//Edycha news
export async function editNews(id: string, title: string, description: string) {
  const token = await getToken();
  const res = await fetch(`${API_URL}/news/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': 'Bearer ' + token } : {})
    },
    body: JSON.stringify({ title, description })
  });
  return res.json();
}

// Usuń news
export async function deleteNews(id: string) {
  const token = await getToken();
  const res = await fetch(`${API_URL}/news/${id}`, {
    method: 'DELETE',
    headers: {
      ...(token ? { 'Authorization': 'Bearer ' + token } : {})
    }
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

// ---------- ZLECENIA ----------

// Pobierz wszystkie zlecenia
export async function getOrders(userId?: number, role?: string) {
  let url = `${API_URL}/orders`;
  if (userId && role) {
    url += `?userId=${userId}&role=${role}`;
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return res.json();
}

// Dodaj zlecenie
export async function addOrder(
  name: string,
  status: string,
  date: string,
  opis: string,
  lat: number,
  lng: number,
  createdBy: number,
  assignedGuard: number
) {
  const token = await getToken();

  const res = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    body: JSON.stringify({
      name,
      status,
      date,
      opis,
      lat,
      lng,
      paymentStatus: 'unpaid',
      createdBy,
      assignedGuard
    })
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Błąd ${res.status}: ${errorText}`);
  }

  return res.json();
}


// Pobierz jedno zlecenie po ID
export async function getOrder(id: number) {
  const res = await fetch(`${API_URL}/orders/${id}`);
  return res.json();
}

// Edytuj zlecenie po ID
export async function updateOrder(id: number, data: {
  name: string;
  status: string;
  date: string;
  opis?: string;
  lat?: number;
  lng?: number;
  paymentStatus?: string;
}) {
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

// Aktualizacja statusu zlecenia
export async function updateOrderStatus(orderId: string, status: string): Promise<any> {
  const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  return res.json();
}

export async function getMyOrders(userId: number) {
  const res = await fetch(`${API_URL}/orders/my?userId=${userId}`);
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return await res.json();
}

// Funkcja pobierająca ochroniarzy do api.ts
export interface GuardType {
  id: number;
  imie: string;
  nazwisko: string;
  username: string;
  mail: string;
  numertelefonu: string;
  stanowisko: string;
  avatar?: string;
  lokalizacja: string;
  plec: string;
  lata_doswiadczenia: number;
  specjalnosci: string;
  licencja_bron: number;
  opinia: number;
}

export async function searchGuards(filters: Partial<GuardType> = {}): Promise<GuardType[]> {
  const params = new URLSearchParams(filters as any).toString();
  const res = await fetch(`${API_URL}/profiles/guards?${params}`);
  if (!res.ok) throw new Error('Błąd pobierania ochroniarzy');
  return await res.json();
}

// ---------- WPŁATY ----------

// Lista wpłat
export async function getPaymentList(userId?: number, role?: string) {
  let url = `${API_URL}/payment/list`;
  if (userId && role) {
    url += `?userId=${userId}&role=${role}`;
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return res.json();
}

// Tworzenie płatności
export async function manualCreatePayment(orderId: string): Promise<any> {
  const res = await fetch(`${API_URL}/payment/manual-create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId}),
  });
  return res.json();
}



// strzał z wpłaty do payu
export async function payPayment(paymentId: string, email: string): Promise<Response> {
  return await fetch(`${API_URL}/payment/pay`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paymentId, email }),
  });
}
// Zatwierdzenie płatności (admin)
export async function confirmPayment(paymentId: string): Promise<ApiResponse> {
  const token = await getToken();
  try {
    const res = await fetch(`${API_URL}/payment/${paymentId}/confirm`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });

    if (!res.ok) {
      const errorText = await res.text();
      return { success: false, error: errorText };
    }

    const data = await res.json();
    return { success: true, data };
  } catch (err) {
    return { success: false, error: 'Błąd połączenia' };
  }
}

export type Raport = {
  id: number;
  orderId: number;
  guardId: number;
  description: string;
  audioNote?: string;
  photo?: string;
  createdAt: string;
};

export async function getRaports(orderId: number): Promise<Raport[]> {
  const res = await fetch(`${API_URL}/reports?orderId=${orderId}`);
  if (!res.ok) throw new Error('Błąd pobierania raportów');
  return await res.json();
}

export async function addRaport({
  orderId,
  guardId,
  description,
  photoUri,
  audioUri,
}: {
  orderId: number;
  guardId: number;
  description: string;
  photoUri?: string;
  audioUri?: string;
}) {
  const formData = new FormData();
  formData.append("orderId", orderId.toString());
  formData.append("guardId", guardId.toString());
  formData.append("description", description);

  if (photoUri)
    formData.append("photo", {
      uri: photoUri,
      name: "photo.jpg",
      type: "image/jpeg",
    } as any);

  if (audioUri)
    formData.append("audioNote", {
      uri: audioUri,
      name: "note.m4a",
      type: "audio/mp4",
    } as any);

  const token = await getToken();
  const headers: any = {
    "Content-Type": "multipart/form-data",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${API_URL}/reports`, {
    method: "POST",
    body: formData,
    headers,
  });

  let response;
  try {
    response = await res.json();
  } catch (err) {
    response = {};
  }

  if (!res.ok) {
    throw new Error(
      response?.error ||
      response?.message ||
      "Błąd wysyłania raportu"
    );
  }
  return response;
}

export async function getAllRaports(): Promise<Raport[]> {
  const res = await fetch(`${API_URL}/reports/all`);
  if (!res.ok) throw new Error('Błąd pobierania raportów');
  return await res.json();
}

export async function getUserRaports(userId: number): Promise<Raport[]> {
  const res = await fetch(`${API_URL}/reports/byUser/${userId}`);
  if (!res.ok) throw new Error('Błąd pobierania raportów');
  return await res.json();
}


