import React, { useState } from 'react';
import {Text, StyleSheet, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../ThemeContext/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const EditProfileScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const backgroundColor = theme === 'dark' ? '#303030' : '#ffffff';
  const textColor = theme === 'dark' ? '#ffffff' : '#000000';
  const inputBackground = theme === 'dark' ? '#424242' : '#f0f0f0';

  // Mock domyślne dane
  const [name, setName] = useState('Mirek Kowalski');
  const [email, setEmail] = useState('mirek@example.com');
  const [phone, setPhone] = useState('+48 123 456 789');

  const handleSave = () => {
    if (!name || !email || !phone) {
      Alert.alert('Błąd', 'Wszystkie pola są wymagane.');
      return;
    }

    // Tu można dodać walidację, wysłanie danych na backend itp.
    Alert.alert('Sukces', 'Dane zostały zapisane.');
    navigation.goBack();
  };

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
  container: {
    flex: 1,
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    marginTop: 15,
  },
  input: {
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  saveButton: {
    marginTop: 30,
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
  },
});