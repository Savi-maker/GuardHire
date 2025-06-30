import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Switch,
  Alert,
} from 'react-native';
import { useTheme } from '../ThemeContext/ThemeContext';
import { searchGuards, GuardType } from '../../utils/api';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const miasta = [
  'Warszawa','Kielce','Kraków','Wrocław','Poznań','Gdańsk','Katowice','Łódź','Lublin','Szczecin','Bydgoszcz'
];
const plecOptions = [
  { label: 'Dowolna', value: '' },
  { label: 'Mężczyzna', value: 'M' },
  { label: 'Kobieta', value: 'K' },
];
const specjalnosciOptions = [
  'Ochrona VIP','Ochrona imprez','Konwojowanie','Monitoring','Ochrona obiektów'
];

const SearchScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const isDark = theme === 'dark';

  // Filtrowanie
  const [imie, setImie] = useState('');
  const [nazwisko, setNazwisko] = useState('');
  const [lokalizacja, setLokalizacja] = useState('');
  const [plec, setPlec] = useState('');
  const [minLata, setMinLata] = useState('');
  const [specjalnosc, setSpecjalnosc] = useState('');
  const [licencjaBron, setLicencjaBron] = useState(false);
  const [minOpinia, setMinOpinia] = useState('1');

  // Wyniki
  const [guards, setGuards] = useState<GuardType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    setLoading(true); setError(null);
    try {
      const filters: any = {};
      if (imie) filters.imie = imie;
      if (nazwisko) filters.nazwisko = nazwisko;
      if (lokalizacja) filters.lokalizacja = lokalizacja;
      if (plec) filters.plec = plec;
      if (minLata) filters.lata_doswiadczenia = minLata;
      if (specjalnosc) filters.specjalnosci = specjalnosc;
      if (licencjaBron) filters.licencja_bron = '1';
      if (minOpinia) filters.opinia_min = minOpinia;

      const result = await searchGuards(filters);
      setGuards(result);

      // Jeśli coś znaleziono – pokaż SuccessScreen (i licznik wyników)
      if (result.length > 0) {
        navigation.navigate('Success', { count: result.length });
      } else {
        Alert.alert('Brak wyników', 'Nie znaleziono ochroniarzy spełniających kryteria.');
      }
    } catch (e) {
      setError('Błąd podczas wyszukiwania ochroniarzy.');
    } finally {
      setLoading(false);
    }
  };

  const renderGuard = ({ item }: { item: GuardType }) => (
    <View style={[
      styles.card,
      { backgroundColor: isDark ? '#232323' : '#fff', shadowColor: isDark ? '#000' : '#bbb' }
    ]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: isDark ? '#fff' : '#222' }]}>
          {item.imie} {item.nazwisko}
        </Text>
        <Text style={[styles.cardSpec, { color: isDark ? '#aaa' : '#007AFF' }]} numberOfLines={1}>
          {item.specjalnosci}
        </Text>
      </View>
      <Text style={[styles.cardText, { color: isDark ? '#ddd' : '#222' }]}>
        Lokalizacja: <Text style={{ fontWeight: '600' }}>{item.lokalizacja}</Text>
      </Text>
      <Text style={[styles.cardText, { color: isDark ? '#ddd' : '#222' }]}>
        Doświadczenie: <Text style={{ fontWeight: '600' }}>{item.lata_doswiadczenia} lat</Text>
      </Text>
      <Text style={[styles.cardText, { color: isDark ? '#ddd' : '#222' }]}>
        Opinia: <Ionicons name="star" size={15} color="#FFD700" /> {item.opinia}/10
      </Text>
      <Text style={[styles.cardText, { color: isDark ? '#ddd' : '#222' }]}>
        Licencja na broń: {item.licencja_bron ? 'Tak' : 'Nie'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#191919' : '#f5f5f5' }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.filtersSection}>
          <Text style={[styles.filtersTitle, { color: isDark ? '#fff' : '#222' }]}>
            Filtruj ochroniarzy
          </Text>
          <View style={styles.filtersRow}>
            <TextInput
              style={[styles.input, { backgroundColor: isDark ? '#323232' : '#f0f0f0', color: isDark ? '#fff' : '#222' }]}
              placeholder="Imię"
              value={imie}
              onChangeText={setImie}
              placeholderTextColor="#999"
            />
            <TextInput
              style={[styles.input, { backgroundColor: isDark ? '#323232' : '#f0f0f0', color: isDark ? '#fff' : '#222' }]}
              placeholder="Nazwisko"
              value={nazwisko}
              onChangeText={setNazwisko}
              placeholderTextColor="#999"
            />
          </View>
          <View style={styles.filtersRow}>
            <TextInput
              style={[styles.input, { backgroundColor: isDark ? '#323232' : '#f0f0f0', color: isDark ? '#fff' : '#222' }]}
              placeholder="Lokalizacja (miasto)"
              value={lokalizacja}
              onChangeText={setLokalizacja}
              placeholderTextColor="#999"
            />
            <TextInput
              style={[styles.input, { backgroundColor: isDark ? '#323232' : '#f0f0f0', color: isDark ? '#fff' : '#222' }]}
              placeholder="Specjalność"
              value={specjalnosc}
              onChangeText={setSpecjalnosc}
              placeholderTextColor="#999"
            />
          </View>
          <View style={styles.filtersRow}>
            <TextInput
              style={[styles.input, { backgroundColor: isDark ? '#323232' : '#f0f0f0', color: isDark ? '#fff' : '#222' }]}
              placeholder="Płeć (M/K)"
              value={plec}
              onChangeText={setPlec}
              placeholderTextColor="#999"
              maxLength={1}
            />
            <TextInput
              style={[styles.input, { backgroundColor: isDark ? '#323232' : '#f0f0f0', color: isDark ? '#fff' : '#222' }]}
              placeholder="Min. lat doświadczenia"
              value={minLata}
              onChangeText={setMinLata}
              placeholderTextColor="#999"
              keyboardType="numeric"
              maxLength={2}
            />
          </View>
          <View style={styles.filtersRow}>
            <Text style={[styles.label, { color: isDark ? '#fff' : '#222', marginRight: 10 }]}>Licencja na broń</Text>
            <Switch value={licencjaBron} onValueChange={setLicencjaBron} />
            <Text style={[styles.label, { color: isDark ? '#fff' : '#222', marginLeft: 18 }]}>Min. opinia</Text>
            <TextInput
              style={[styles.input, {
                backgroundColor: isDark ? '#323232' : '#f0f0f0',
                color: isDark ? '#fff' : '#222',
                width: 60,
              }]}
              placeholder="1-10"
              value={minOpinia}
              onChangeText={setMinOpinia}
              placeholderTextColor="#999"
              keyboardType="numeric"
              maxLength={2}
            />
          </View>
          <TouchableOpacity
            style={[styles.searchBtn, { backgroundColor: isDark ? '#2196f3' : '#007AFF' }]}
            onPress={handleSearch}
            disabled={loading}
          >
            <Ionicons name="search" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>Wyszukaj</Text>
          </TouchableOpacity>
        </View>

        <View style={{ flex: 1, marginTop: 10 }}>
          {loading && <ActivityIndicator size="large" color={isDark ? '#fff' : '#007AFF'} />}
          {error && (
            <Text style={{ color: '#FF3B30', textAlign: 'center', marginBottom: 10 }}>{error}</Text>
          )}
          <FlatList
            data={guards}
            renderItem={renderGuard}
            keyExtractor={item => String(item.id)}
            contentContainerStyle={{ padding: 10 }}
            ListEmptyComponent={() =>
              !loading && (
                <Text style={{ textAlign: 'center', color: isDark ? '#aaa' : '#888' }}>
                  Brak wyników. Spróbuj innych filtrów.
                </Text>
              )
            }
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SearchScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  filtersSection: { padding: 18, paddingTop: 10, borderRadius: 14, margin: 10, elevation: 2 },
  filtersTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8, marginLeft: 2 },
  filtersRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 9 },
  input: { flex: 1, borderRadius: 8, paddingHorizontal: 12, fontSize: 15, height: 40, marginHorizontal: 2 },
  label: { fontSize: 14, fontWeight: '600' },
  searchBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 8, paddingVertical: 10, marginTop: 8 },
  card: { borderRadius: 12, padding: 14, marginBottom: 12, shadowOpacity: 0.12, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '700', flex: 1 },
  cardSpec: { fontSize: 13, fontWeight: '500', marginLeft: 10, flexShrink: 1 },
  cardText: { fontSize: 14, marginTop: 2, fontWeight: '400' },
});
