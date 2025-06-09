import React, { useLayoutEffect, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Payment'>;

type PaymentItem = {
  id: string;
  orderId: string;
  amount: number;
  status: string;
  createdAt: string;
};

const PaymentScreen: React.FC = () => {
  const [view, setView] = useState<'zaleglosci' | 'historia'>('zaleglosci');
  const [zaleglosci, setZaleglosci] = useState<PaymentItem[]>([]);
  const [historia, setHistoria] = useState<PaymentItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
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

  useEffect(() => {
    fetch('http://192.168.0.19:3000/payment/list')
      .then(res => res.json())
      .then((data: PaymentItem[]) => {
        const pending = data.filter(item => item.status === 'pending');
        const done = data.filter(item => item.status !== 'pending');
        setZaleglosci(pending);
        setHistoria(done);
      })
      .catch(err => {
        console.error('Błąd ładowania płatności:', err);
        Alert.alert('Błąd', 'Nie udało się pobrać danych płatności');
      });
  }, []);

  const handleOplac = async (id: string, amount: number) => {
  console.log('Kliknięto opłać:', id, amount);

  try {
    const response = await fetch('http://192.168.0.19:3000/payment/pay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: id,
        amount,
        buyer: { email: 'janek@guardhire.pl' },
        email: 'janek@guardhire.pl'
      })
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Błąd odpowiedzi:', response.status, text);
      Alert.alert('Błąd', 'Nie udało się utworzyć płatności');
      return;
    }

    const data: { redirectUri?: string } = await response.json();

    const numericId = parseInt(id);
    if (numericId % 2 === 0) {

      setTimeout(() => {
        fetch('http://192.168.0.19:3000/payment/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: id,
            status: 'COMPLETED',
          }),
        })
          .then(res => res.text())
          .then(console.log)
          .catch(console.error);
      }, 2000); 
      Alert.alert('Sukces', 'Symulowana płatność została oznaczona jako zakończona.');
    } else if (data.redirectUri) {
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

  const getPaginatedData = (data: PaymentItem[]) => {
    const start = (currentPage - 1) * itemsPerPage;
    return data.slice(start, start + itemsPerPage);
  };

  const totalPages = Math.ceil((view === 'zaleglosci' ? zaleglosci.length : historia.length) / itemsPerPage);

  const renderHeader = () => (
    <View style={[styles.row, styles.headerRow]}>
      <Text style={[styles.cell, styles.headerText]}>LP</Text>
      <Text style={[styles.cell, styles.headerText]}>Kwota</Text>
      <Text style={[styles.cell, styles.headerText]}>Akcja</Text>
    </View>
  );

  const renderZaleglosci = () => (
    <FlatList
      data={getPaginatedData(zaleglosci)}
      keyExtractor={item => item.id}
      ListHeaderComponent={renderHeader}
      renderItem={({ item, index }) => (
        <View style={styles.row}>
          <Text style={styles.cell}>{(currentPage - 1) * itemsPerPage + index + 1}</Text>
          <Text style={styles.cell}>{item.amount.toFixed(2)} PLN</Text>
          <TouchableOpacity style={styles.button} onPress={() => handleOplac(item.orderId, item.amount)}>
            <Text style={styles.buttonText}>Opłać</Text>
          </TouchableOpacity>
        </View>
      )}
    />
  );

  const renderHistoria = () => (
    <FlatList
      data={getPaginatedData(historia)}
      keyExtractor={item => item.id}
      ListHeaderComponent={renderHeader}
      renderItem={({ item, index }) => (
        <View style={styles.row}>
          <Text style={styles.cell}>{(currentPage - 1) * itemsPerPage + index + 1}</Text>
          <Text style={styles.cell}>{item.amount.toFixed(2)} PLN</Text>
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
        <View style={styles.pagination}>
          <TouchableOpacity
            onPress={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            style={styles.pageButton}
          >
            <Text style={styles.pageButtonText}>◀</Text>
          </TouchableOpacity>
          <Text style={styles.pageInfo}>{currentPage} / {totalPages || 1}</Text>
          <TouchableOpacity
            onPress={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            style={styles.pageButton}
          >
            <Text style={styles.pageButtonText}>▶</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerButton} onPress={() => { setView('zaleglosci'); setCurrentPage(1); }}>
          <Text style={styles.footerButtonText}>Zaległości</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerButton} onPress={() => { setView('historia'); setCurrentPage(1); }}>
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
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  pageButton: {
    padding: 10,
  },
  pageButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  pageInfo: {
    marginHorizontal: 10,
    fontSize: 16,
  },
});
