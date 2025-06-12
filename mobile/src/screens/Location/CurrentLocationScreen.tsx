import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, Linking } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { SafeAreaView } from 'react-native-safe-area-context';

const CurrentLocationScreen = () => {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Brak uprawnień do lokalizacji');
        setLoading(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      setLoading(false);
    })();
  }, []);

  const handleNavigate = () => {
    if (location) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}&travelmode=driving`;
      Linking.openURL(url);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Oto Twoja lokalizacja</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : location ? (
        <>
          <MapView
            style={styles.map}
            region={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Marker coordinate={location} title="Jesteś tutaj" />
          </MapView>

          <TouchableOpacity style={styles.button} onPress={handleNavigate}>
            <Text style={styles.buttonText}>Nawiguj</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text>Nie udało się pobrać lokalizacji</Text>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  header: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  map: { flex: 1, borderRadius: 10 },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    marginTop: 15,
    borderRadius: 8,
    alignItems: 'center'
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default CurrentLocationScreen;
