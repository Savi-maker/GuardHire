import React, { useState, useEffect } from 'react';
import {
  StyleSheet, TextInput, Text, Pressable, ActivityIndicator,
  Alert, FlatList, View, Modal, Keyboard
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
import MapView, { Marker, MapPressEvent } from 'react-native-maps';
import { addOrder, API_URL,getMyProfile } from '../../utils/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../ThemeContext/ThemeContext';

export interface FormInputs {
  name: string;
  opis: string;
}

const FormScreen: React.FC = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormInputs>();
  const [loading, setLoading] = useState(false);
  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(null);
  const [guards, setGuards] = useState<{ id: number; username: string }[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredGuards, setFilteredGuards] = useState<{ id: number; username: string }[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedGuard, setSelectedGuard] = useState<{ id: number, username: string } | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/profiles/guards`)
      .then(res => res.json())
      .then(data => setGuards(data))
      .catch(() => Alert.alert('Błąd', 'Nie udało się pobrać ochroniarzy'));
  }, []);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    const filtered = guards.filter(g =>
      g.username.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredGuards(filtered);
  };

  const onMapPress = (event: MapPressEvent) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setMarker({ lat: latitude, lng: longitude });
  };

  const onSubmit = async (data: FormInputs) => {
    if (!marker) {
      Alert.alert('Błąd', 'Proszę zaznaczyć lokalizację na mapie.');
      return;
    }
    if (!selectedGuard) {
      Alert.alert('Błąd', 'Proszę wybrać ochroniarza.');
      return;
    }

    setLoading(true);
    try {
      const profile = await getMyProfile();
      const response = await addOrder(
        data.name, 'nowe', new Date().toISOString(),
        data.opis, marker.lat, marker.lng, profile.id, selectedGuard.id
      );

      if (response && response.success) {
        Alert.alert('Sukces', 'Zlecenie zostało zapisane.');
        reset();
        setMarker(null);
        setSelectedGuard(null);
        navigation.goBack();
      } else {
        const errorMsg = response?.error || 'Nie udało się dodać zlecenia.';
        Alert.alert('Błąd', errorMsg);
      }
    } catch (e) {
      console.error('Błąd zapisu zlecenia:', e);
      Alert.alert('Błąd', 'Wystąpił problem z połączeniem.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#303030' : '#fff' }]}>
      <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]}>Dodaj nowe zlecenie</Text>

      <Controller
        control={control}
        name="name"
        rules={{ required: 'Nazwa zlecenia jest wymagana' }}
        render={({ field: { onChange, onBlur, value } }) => (
          <>
            <TextInput
              placeholder="Nazwa zlecenia"
              placeholderTextColor={isDark ? '#aaa' : '#888'}
              style={[
                styles.input,
                { color: isDark ? '#fff' : '#000', borderColor: isDark ? '#555' : '#aaa' },
                errors.name && styles.inputError
              ]}
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}
          </>
        )}
      />

      <Controller
        control={control}
        name="opis"
        rules={{ required: 'Opis jest wymagany' }}
        render={({ field: { onChange, onBlur, value } }) => (
          <>
            <TextInput
              placeholder="Opis zlecenia"
              placeholderTextColor={isDark ? '#aaa' : '#888'}
              style={[
                styles.input, styles.multilineInput,
                { color: isDark ? '#fff' : '#000', borderColor: isDark ? '#555' : '#aaa' },
                errors.opis && styles.inputError
              ]}
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              multiline
              numberOfLines={4}
            />
            {errors.opis && <Text style={styles.errorText}>{errors.opis.message}</Text>}
          </>
        )}
      />

      <Pressable
        style={[styles.searchButton]}
        onPress={() => setShowModal(true)}
      >
        <Text style={{ color: '#fff' }}>
          {selectedGuard ? `Wybrano: ${selectedGuard.username}` : 'Szukaj ochroniarza'}
        </Text>
      </Pressable>

      <Text style={{ marginVertical: 10, color: isDark ? '#fff' : '#000' }}>Zaznacz miejsce na mapie:</Text>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 51.107883,
          longitude: 17.038538,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05
        }}
        onPress={onMapPress}
      >
        {marker && <Marker coordinate={{ latitude: marker.lat, longitude: marker.lng }} />}
      </MapView>

      <Pressable
        onPress={handleSubmit(onSubmit)}
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed
        ]}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Zapisz zlecenie</Text>}
      </Pressable>

      <Modal visible={showModal} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#303030' : '#fff' }}>
          <View style={styles.modalContainer}>
            <TextInput
              placeholder="Wyszukaj ochroniarza"
              placeholderTextColor={isDark ? '#aaa' : '#888'}
              value={searchQuery}
              onChangeText={handleSearch}
              style={[
                styles.input,
                { color: isDark ? '#fff' : '#000', borderColor: isDark ? '#555' : '#aaa' }
              ]}
              autoFocus
            />
            <FlatList
              data={searchQuery ? (filteredGuards.length > 0 ? filteredGuards : guards) : guards}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.guardBtn}
                  onPress={() => {
                    setSelectedGuard(item);
                    setShowModal(false);
                    setSearchQuery('');
                    setFilteredGuards([]);
                    Keyboard.dismiss();
                  }}
                >
                  <Text style={{ color: isDark ? '#fff' : '#000' }}>{item.username}</Text>
                </Pressable>
              )}
              keyboardShouldPersistTaps="handled"
            />
            <Pressable
              style={styles.closeButton}
              onPress={() => setShowModal(false)}
            >
              <Text style={{ color: '#fff' }}>Zamknij</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, flex: 1 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  input: { borderWidth: 1, borderRadius: 6, padding: 12, marginBottom: 8 },
  inputError: { borderColor: '#d32f2f' },
  multilineInput: { height: 100, textAlignVertical: 'top' },
  errorText: { color: '#d32f2f', marginBottom: 8 },
  map: { height: 300, borderRadius: 6, marginBottom: 16 },
  button: { backgroundColor: '#4caf50', padding: 14, borderRadius: 6, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  buttonPressed: { opacity: 0.8 },
  searchButton: { backgroundColor: '#348fff', padding: 12, borderRadius: 6, alignItems: 'center', marginBottom: 8 },
  guardBtn: { padding: 12, borderBottomWidth: 1, borderColor: '#ddd' },
  modalContainer: { flex: 1, padding: 16 },
  closeButton: { backgroundColor: '#555', padding: 12, borderRadius: 6, alignItems: 'center', marginTop: 10 }
});

export default FormScreen;
