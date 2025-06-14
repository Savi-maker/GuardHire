import React, { useState } from 'react';
import { StyleSheet, ScrollView, TextInput, Text, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
import MapView, { Marker, MapPressEvent } from 'react-native-maps';
import { addOrder } from '../../utils/api'; 
import { SafeAreaView } from 'react-native-safe-area-context';

export interface FormInputs {
  name: string;
  opis: string;
}

const FormScreen: React.FC = () => {
  const navigation = useNavigation();
  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormInputs>();
  const [loading, setLoading] = useState(false);
  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(null);

  const onMapPress = (event: MapPressEvent) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setMarker({ lat: latitude, lng: longitude });
  };

  const onSubmit = async (data: FormInputs) => {
    if (!marker) {
      Alert.alert('Błąd', 'Proszę zaznaczyć lokalizację na mapie.');
      return;
    }

    setLoading(true);
    try {
      const date = new Date().toISOString();
      const status = 'nowe';

      const response = await addOrder(
        data.name,
        status,
        data.opis,
        marker.lat,
        marker.lng
      );

      if (!response.success) {
        Alert.alert('Sukces', 'Zlecenie zostało zapisane.');
        reset();
        setMarker(null);
        navigation.goBack();
      } else {
        Alert.alert('Błąd', response.error || 'Nie udało się dodać zlecenia.');
      }
    } catch (error) {
      Alert.alert('Błąd', 'Wystąpił problem z połączeniem.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={styles.container}>
        <Text style={styles.title}>Dodaj nowe zlecenie</Text>

        <Controller
          control={control}
          name="name"
          rules={{ required: 'Nazwa zlecenia jest wymagana' }}
          render={({ field: { onChange, onBlur, value } }) => (
            <>
              <TextInput
                placeholder="Nazwa zlecenia"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                style={[styles.input, errors.name && styles.inputError]}
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
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                style={[styles.input, styles.multilineInput, errors.opis && styles.inputError]}
                multiline
                numberOfLines={4}
              />
              {errors.opis && <Text style={styles.errorText}>{errors.opis.message}</Text>}
            </>
          )}
        />

        <Text style={{ marginBottom: 8 }}>Zaznacz miejsce na mapie:</Text>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: 51.107883, 
            longitude: 17.038538,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          onPress={onMapPress}
        >
          {marker && (
            <Marker coordinate={{ latitude: marker.lat, longitude: marker.lng }} />
          )}
        </MapView>

        <Pressable
          onPress={handleSubmit(onSubmit)}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Zapisz zlecenie</Text>}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
  },
  inputError: {
    borderColor: '#d32f2f',
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#d32f2f',
    marginBottom: 8,
  },
  map: {
    height: 300,
    borderRadius: 6,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#4caf50',
    padding: 14,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  buttonPressed: {
    opacity: 0.8,
  },
});

export default FormScreen;
