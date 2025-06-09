import React, { useLayoutEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Payment'>;

const mockZaleglosci = [
  { id: '1', kwota: '120.00 PLN' },
  { id: '2', kwota: '89.50 PLN' },
];

const mockHistoria = [
  { id: '1', kwota: '100.00 PLN' },
  { id: '2', kwota: '60.25 PLN' },
];

const PaymentScreen: React.FC = () => {
  const [view, setView] = useState<'zaleglosci' | 'historia'>('zaleglosci');
  const navigation = useNavigation<NavigationProp>();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Płatności',
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.navigate('Main')} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>🏠 HOME</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const handleOplac = async (id: string, kwota: string) => {
    const amount = parseFloat(kwota.replace(' PLN', ''));
    console.log('Kliknięto opłać:', id, kwota);

    try {
      const response = await fetch('http://192.168.0.19:3000/payment/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: id,
          amount,
          buyer: { email: 'janek@guardhire.pl' },
          email:'janek@guardhire.pl'
        })
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('Błąd odpowiedzi:', response.status, text);
        Alert.alert('Błąd', 'Nie udało się utworzyć płatności');
        return;
      }

      const data: { redirectUri?: string } = await response.json();
      console.log('Odpowiedź serwera:', data);

      if (data.redirectUri) {
        const supported = await Linking.canOpenURL(data.redirectUri);
        if (supported) {
          await Linking.openURL(data.redirectUri);
        } else {
          Alert.alert('Błąd', 'Nie można otworzyć adresu płatności');
        }
      } else {
        Alert.alert('Błąd', 'Brak redirectUri w odpowiedzi serwera');
      }
    } catch (err) {
      console.error('Błąd płatności:', err);
      Alert.alert('Błąd połączenia', 'Spróbuj ponownie później');
    }
  };

  const handlePrzejdzDoSzczegolow = (id: string) => {
    navigation.navigate('TransactionDetails', { transactionId: id });
  };

  const renderHeader = () => (
    <View style={[styles.row, styles.headerRow]}>
      <Text style={[styles.cell, styles.headerText]}>LP</Text>
      <Text style={[styles.cell, styles.headerText]}>Kwota</Text>
      <Text style={[styles.cell, styles.headerText]}>Akcja</Text>
    </View>
  );

  const renderZaleglosci = () => (
    <FlatList
      data={mockZaleglosci}
      keyExtractor={item => item.id}
      ListHeaderComponent={renderHeader}
      renderItem={({ item, index }) => (
        <View style={styles.row}>
          <Text style={styles.cell}>{index + 1}</Text>
          <Text style={styles.cell}>{item.kwota}</Text>
          <TouchableOpacity style={styles.button} onPress={() => handleOplac(item.id, item.kwota)}>
            <Text style={styles.buttonText}>Opłać</Text>
          </TouchableOpacity>
        </View>
      )}
    />
  );

  const renderHistoria = () => (
    <FlatList
      data={mockHistoria}
      keyExtractor={item => item.id}
      ListHeaderComponent={renderHeader}
      renderItem={({ item, index }) => (
        <View style={styles.row}>
          <Text style={styles.cell}>{index + 1}</Text>
          <Text style={styles.cell}>{item.kwota}</Text>
          <TouchableOpacity
            style={styles.buttonSecondary}
            onPress={() => handlePrzejdzDoSzczegolow(item.id)}
          >
            <Text style={styles.buttonText}>Historia</Text>
          </TouchableOpacity>
        </View>
      )}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.table}>
        {view === 'zaleglosci' ? renderZaleglosci() : renderHistoria()}
      </View>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerButton} onPress={() => setView('zaleglosci')}>
          <Text style={styles.footerButtonText}>Zaległości</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerButton} onPress={() => setView('historia')}>
          <Text style={styles.footerButtonText}>Historia</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PaymentScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  table: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
  },
  headerRow: {
    borderBottomWidth: 2,
    backgroundColor: '#f0f0f0',
  },
  headerText: {
    fontWeight: 'bold',
  },
  cell: {
    flex: 1,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#4caf50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  buttonSecondary: {
    backgroundColor: '#2196f3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
  footerButton: {
    backgroundColor: '#333',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  footerButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  headerButton: {
    marginRight: 16,
    padding: 6,
  },
  headerButtonText: {
    color: '#007bff',
    fontWeight: 'bold',
  },
});
