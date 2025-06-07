import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../ThemeContext/ThemeContext';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getMyProfile } from '../../utils/api';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const UserProfileScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const isFocused = useIsFocused();
  const backgroundColor = theme === 'dark' ? '#303030' : '#ffffff';
  const textColor = theme === 'dark' ? '#ffffff' : '#000000';

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const profile = await getMyProfile();
        setUser(profile);
      } catch (error) {
        console.error('Błąd ładowania profilu:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    if (isFocused) {
      fetchProfile();
    }
  }, [isFocused]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={textColor} />
      </SafeAreaView>
    );
  }

  const finalUser = user || {
    imie: 'Błąd',
    nazwisko: 'Ładowania',
    stanowisko: 'Nieznane',
    mail: 'brak@danych.pl',
    numertelefonu: '---',
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <Text style={[styles.headerText, { color: textColor }]}>Twój profil</Text>
      </View>

      <View style={styles.avatarContainer}>
        <Image source={require('../../../assets/images/avatar.png')} style={styles.avatar} />
        <Text style={[styles.name, { color: textColor }]}>{finalUser.imie} {finalUser.nazwisko}</Text>
        <Text style={[styles.role, { color: textColor }]}>{finalUser.stanowisko}</Text>
      </View>

      <View style={styles.infoBox}>
        <Ionicons name="mail" size={20} color={textColor} />
        <Text style={[styles.infoText, { color: textColor }]}>{finalUser.mail}</Text>
      </View>

      <View style={styles.infoBox}>
        <Ionicons name="call" size={20} color={textColor} />
        <Text style={[styles.infoText, { color: textColor }]}>{finalUser.numertelefonu}</Text>
      </View>

      <TouchableOpacity
        style={[styles.editButton, { borderColor: textColor }]}
        onPress={() => navigation.navigate('EditProfile')}
      >
        <Ionicons name="create-outline" size={20} color={textColor} style={{ marginRight: 10 }} />
        <Text style={[styles.editText, { color: textColor }]}>Edytuj profil</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default UserProfileScreen;

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  header: { marginTop: 10, marginBottom: 20 },
  headerText: { fontSize: 22, fontWeight: 'bold' },
  avatarContainer: { alignItems: 'center', marginBottom: 30 },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 10 },
  name: { fontSize: 20, fontWeight: '600' },
  role: { fontSize: 14, color: '#888' },
  infoBox: { flexDirection: 'row', alignItems: 'center', marginVertical: 10 },
  infoText: { marginLeft: 10, fontSize: 16 },
  editButton: {
    marginTop: 30,
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editText: { fontSize: 16, fontWeight: '600' },
});
