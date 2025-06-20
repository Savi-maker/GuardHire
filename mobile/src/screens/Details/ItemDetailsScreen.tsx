import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../ThemeContext/ThemeContext';
import { getOrder } from '../../utils/api';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ItemDetails'>;

const ItemDetailsScreen: React.FC<Props> = ({ route }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [order, setOrder] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);

  const { orderId } = route.params;

  useEffect(() => {
    (async () => {
      try {
        const data = await getOrder(orderId);
        setOrder(data);
      } catch (err) {
        console.error('Błąd pobierania zlecenia:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [orderId]);

  const backgroundColor = isDark ? '#121212' : '#f9f9f9';
  const cardBg = isDark ? '#1e1e1e' : '#fff';
  const textColor = isDark ? '#fff' : '#000';
  const subText = isDark ? '#ccc' : '#555';

  if (loading) {
    return (
      <SafeAreaView style={[styles.loaderContainer, { backgroundColor }]}>
        <ActivityIndicator size="large" color={isDark ? '#2196F3' : '#007AFF'} />
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={[styles.loaderContainer, { backgroundColor }]}>
        <Text style={{ color: textColor }}>Nie udało się załadować zlecenia.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor }}>
      <ScrollView style={styles.container}>
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <Text style={[styles.title, { color: textColor }]}>{order.name ?? 'Brak nazwy'}</Text>

          <Text style={[styles.label, { color: subText }]}>Status</Text>
          <Text style={{ color: textColor }}>{order.status ?? 'Brak'}</Text>

          <Text style={[styles.label, { color: subText }]}>Data utworzenia</Text>
          <Text style={{ color: textColor }}>
            {order.date ? new Date(order.date).toLocaleString() : 'Brak'}
          </Text>

          <Text style={[styles.label, { color: subText }]}>Opis</Text>
          <Text style={{ color: textColor }}>{order.opis ?? 'Brak'}</Text>

          <Text style={[styles.label, { color: subText }]}>Status płatności</Text>
          <Text style={{ color: textColor }}>{order.paymentStatus ?? 'Brak'}</Text>

          <Text style={[styles.label, { color: subText }]}>Przypisany ochroniarz</Text>
          <Text style={{ color: textColor }}>
            {order.assignedGuardName ?? order.assignedGuard ?? 'Brak'}
          </Text>

          {order.lat && order.lng && (
            <>
              <Text style={[styles.label, { color: subText }]}>Lokalizacja</Text>
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: Number(order.lat),
                  longitude: Number(order.lng),
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
              >
                <Marker
                  coordinate={{
                    latitude: Number(order.lat),
                    longitude: Number(order.lng)
                  }}
                  title={order.name || 'Zlecenie'}
                />
              </MapView>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ItemDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    padding: 16,
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 10,
    textTransform: 'uppercase',
  },
  map: {
    width: '100%',
    height: 200,
    marginTop: 10,
    borderRadius: 8,
  },
});
