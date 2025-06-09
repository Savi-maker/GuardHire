import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';

const formatDate = (isoString: string): string => {
  const date = new Date(isoString);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${hours}:${minutes} ${day}.${month}.${year}`;
};

const ListScreen: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [currentTab, setCurrentTab] = useState<'active' | 'history'>('active');
  const [selectedModule, setSelectedModule] = useState<'Zlecenia' | 'Kontakty'>('Zlecenia');
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [payments, setPayments] = useState<any[]>([]);
  const [dataActive, setDataActive] = useState<any[]>([]);
  const [dataHistory, setDataHistory] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ordersRes = await fetch('http://192.168.0.19:3000/orders');
        const paymentsRes = await fetch('http://192.168.0.19:3000/payment/list');
        const ordersData = await ordersRes.json();
        const paymentsData = await paymentsRes.json();

        const active = ordersData.filter((o: any) => o.status !== 'zakończone' && o.status !== 'anulowane');
        const history = ordersData.filter((o: any) => o.status === 'zakończone' || o.status === 'anulowane');

        setDataActive(active);
        setDataHistory(history);
        setPayments(paymentsData);
      } catch (err) {
        console.error('Błąd ładowania danych:', err);
      }
    };

    fetchData();
  }, []);

  const handlePayment = async (orderId: string) => {
    const numericId = Number(orderId);
    try {
      await fetch('http://192.168.0.19:3000/payment/manual-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, amount: 1500 })
      });
await fetch(`http://192.168.0.19:3000/orders/${numericId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ status: 'w trakcie' })
    });

    } catch (e) {
      console.warn('Błąd płatności:', e);
    } finally {
      // Odśwież payments
      const updatedPayments = await fetch('http://192.168.0.19:3000/payment/list').then(res => res.json());
      setPayments(updatedPayments);

      setTimeout(() => {
        navigation.navigate('Payment');
      }, 100);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const isPaid = payments.some(p => String(p.orderId) === String(item.id));

    return (
      <View style={styles.row}>
        <Text style={styles.cell}>{item.name}</Text>
        <Text style={styles.cell}>{item.status}</Text>
        <Text style={styles.cell}>{formatDate(item.date)}</Text>
        <TouchableOpacity
          style={[
            styles.payButton,
            { backgroundColor: isPaid ? '#2196f3' : '#4caf50' }
          ]}
          onPress={() => isPaid
            ? navigation.navigate('Payment')
            : handlePayment(item.id)
          }
        >
          <Text style={styles.payButtonText}>
            {isPaid ? 'Przejdź do płatności' : '💸 Opłać'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const getPaginatedData = (data: any[]) => {
    const start = (currentPage - 1) * itemsPerPage;
    return data.slice(start, start + itemsPerPage);
  };

  const renderTable = () => {
    const data = getPaginatedData(currentTab === 'active' ? dataActive : dataHistory);
    const title = currentTab === 'active' ? '🔹 Aktywne zlecenia' : '🔸 Historia zleceń';

    return (
      <>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.table}>
          <View style={styles.header}>
            <Text style={styles.headerCell}>Nazwa</Text>
            <Text style={styles.headerCell}>Status</Text>
            <Text style={styles.headerCell}>Data</Text>
            <Text style={styles.headerCell}>Akcja</Text>
          </View>
          <FlatList
            data={data}
            renderItem={renderItem}
            keyExtractor={(item) => `${item.id}-${payments.length}`} 
          />
        </View>
        <View style={styles.bottomNav}>
          <TouchableOpacity onPress={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
            <Text style={styles.navText}>◀</Text>
          </TouchableOpacity>
          <Text style={styles.navText}>Strona {currentPage}</Text>
          <TouchableOpacity
            onPress={() => setCurrentPage(prev => prev + 1)}
            disabled={getPaginatedData(currentTab === 'active' ? dataActive : dataHistory).length < itemsPerPage}
          >
            <Text style={styles.navText}>▶</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.moduleButton}
          onPress={() => setSelectedModule(prev => (prev === 'Zlecenia' ? 'Kontakty' : 'Zlecenia'))}
        >
          <Ionicons name="list-outline" size={20} color="#007AFF" />
          <Text style={styles.moduleButtonText}>{selectedModule}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Main')}>
          <Ionicons name="close" size={28} color="#FF3B30" />
        </TouchableOpacity>
      </View>
      <View style={styles.contentContainer}>{renderTable()}</View>
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={[styles.navButton, currentTab === 'active' && styles.navButtonActive]}
          onPress={() => setCurrentTab('active')}
        >
          <Text style={styles.navText}>Aktywne</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navButton, currentTab === 'history' && styles.navButtonActive]}
          onPress={() => setCurrentTab('history')}
        >
          <Text style={styles.navText}>Historia</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ListScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 30,
    paddingBottom: 10,
    backgroundColor: '#fff',
    zIndex: 10,
  },
  moduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  moduleButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  table: { marginBottom: 24 },
  header: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 4,
    marginBottom: 8,
  },
  headerCell: {
    flex: 1,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  cell: {
    flex: 1,
    paddingHorizontal: 4,
  },
  payButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  payButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingVertical: 12,
  },
  navButton: {
    padding: 10,
  },
  navButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  navText: {
    fontSize: 16,
  },
});
