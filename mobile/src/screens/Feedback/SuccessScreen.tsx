import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../ThemeContext/ThemeContext';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

type SuccessRouteParam = {
  count?: number;
};

const SuccessScreen: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigation = useNavigation();
  const route = useRoute<RouteProp<{ params: SuccessRouteParam }, 'params'>>();

  // obsługa parametru count (ile wyników znaleziono)
  // fallback na 0 jeśli brak parametru
  const count = (route.params as SuccessRouteParam)?.count ?? 0;

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#181818' : '#fff' }]}>
      <Ionicons name="checkmark-circle-outline" size={84} color={isDark ? '#4caf50' : '#2196f3'} />
      <Text style={[styles.title, { color: isDark ? '#fff' : '#2196f3' }]}>
        Sukces!
      </Text>
      <Text style={[styles.subtitle, { color: isDark ? '#fff' : '#222' }]}>
        Znaleziono <Text style={{ fontWeight: 'bold', color: isDark ? '#8aff80' : '#0e9c44' }}>{count}</Text> ochroniarzy
      </Text>
      <TouchableOpacity
        style={[styles.btn, { backgroundColor: isDark ? '#232323' : '#007AFF' }]}
        onPress={() => navigation.goBack()}
      >
        <Text style={[styles.btnText, { color: '#fff' }]}>Wróć do wyszukiwania</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SuccessScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  title: { fontSize: 30, fontWeight: '700', marginTop: 20, marginBottom: 10 },
  subtitle: { fontSize: 18, fontWeight: '500', marginBottom: 30 },
  btn: { paddingVertical: 12, paddingHorizontal: 38, borderRadius: 10, marginTop: 20 },
  btnText: { fontSize: 17, fontWeight: '600' },
});
