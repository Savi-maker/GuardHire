import React, { useEffect, useState } from 'react';
import { Text, StyleSheet, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../ThemeContext/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../utils/api';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const EditProfileScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const backgroundColor = theme === 'dark' ? '#303030' : '#ffffff';
  const textColor = theme === 'dark' ? '#ffffff' : '#000000';
  const inputBackground = theme === 'dark' ? '#424242' : '#f0f0f0';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) throw new Error('Brak tokenu');

        const response = await fetch(`${API_URL}/profiles/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();

        setName(`${data.imie} ${data.nazwisko}`);
        setEmail(data.mail);
        setPhone(data.numertelefonu);
      } catch (error) {
        Alert.alert('Błąd', 'Nie udało się pobrać danych profilu.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
    if (!name || !email || !phone) {
      Alert.alert('Błąd', 'Wszystkie pola są wymagane.');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Brak tokenu');

      const [imie, ...nazParts] = name.trim().split(' ');
      const nazwisko = nazParts.join(' ') || '';

      const res = await fetch(`${API_URL}/profiles/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          imie,
          nazwisko,
          mail: email,
          numertelefonu: phone,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      Alert.alert('Sukces', 'Dane zostały zapisane.');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Błąd', 'Nie udało się zapisać danych.');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={textColor} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <Text style={[styles.headerText, { color: textColor }]}>Edytuj profil</Text>

          <Text style={[styles.label, { color: textColor }]}>Imię i nazwisko</Text>
          <TextInput
            style={[styles.input, { backgroundColor: inputBackground, color: textColor }]}
            value={name}
            onChangeText={setName}
            placeholder="Imię i nazwisko"
            placeholderTextColor="#999"
          />

          <Text style={[styles.label, { color: textColor }]}>Email</Text>
          <TextInput
            style={[styles.input, { backgroundColor: inputBackground, color: textColor }]}
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={[styles.label, { color: textColor }]}>Telefon</Text>
          <TextInput
            style={[styles.input, { backgroundColor: inputBackground, color: textColor }]}
            value={phone}
            onChangeText={setPhone}
            placeholder="Numer telefonu"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
          />

          <TouchableOpacity style={[styles.saveButton, { borderColor: textColor }]} onPress={handleSave}>
            <Ionicons name="save-outline" size={20} color={textColor} style={{ marginRight: 10 }} />
            <Text style={[styles.saveText, { color: textColor }]}>Zapisz</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default EditProfileScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerText: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  label: { fontSize: 16, marginBottom: 5, marginTop: 15 },
  input: { height: 50, borderRadius: 8, paddingHorizontal: 15, fontSize: 16 },
  saveButton: {
    marginTop: 30,
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveText: { fontSize: 16, fontWeight: '600' },
});
