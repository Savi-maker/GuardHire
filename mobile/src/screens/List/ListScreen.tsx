import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PagerView from 'react-native-pager-view';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import {
  getOrders,
  getPaymentList,
  manualCreatePayment,
  updateOrderStatus
} from '../../utils/api';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const formatDate = (isoString: string): string => {
  const date = new Date(isoString);
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const MM = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${hh}:${mm}  ${dd}.${MM}.${yyyy}`;
};

const ListScreen: React.FC = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [dataActive, setDataActive] = useState<any[]>([]);
  const [dataHistory, setDataHistory] = useState<any[]>([]);
  const pagerRef = useRef<PagerView>(null);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

 useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [orders, pays] = await Promise.all([
        getOrders(),
        getPaymentList(),
      ]);
      setPayments(pays);
      setDataActive(orders.filter((o: any) =>
        o.status !== 'zakończone' &&
        o.status !== 'anulowane'
      ));
      setDataHistory(orders.filter((o: any) =>
        o.status === 'zakończone' ||
        o.status === 'anulowane'
      ));
    } catch (e) {
      console.warn('Błąd fetch:', e);
    }
  };

  const handlePayment = async (orderId: string) => {
    try {
      await manualCreatePayment(orderId); // NA RAZIE WARTOŚĆ NA SZTYWNO DO PODMIANY
      await updateOrderStatus(orderId, 'w trakcie');
    } catch (e) {
      console.warn('Błąd płatności:', e);
    } finally {
      fetchAll();
      setTimeout(() => navigation.navigate('Payment'), 100);
    }
  };

  const renderCard = ({ item }: { item: any }) => {
    const payment     = payments.find(p => String(p.orderId) === String(item.id));
    const isCompleted = payment?.status === 'completed';
    const isPaid      = !!payment && !isCompleted;
    const isOrderPaid = item.status === 'Opłacono';

    
    const cardStyle = [
      styles.card,
      isOrderPaid && styles.cardPaidOrder
    ];

    
    let btnStyle, btnText, onPress;
    if (isOrderPaid) {
      btnStyle = styles.btnCompleted;
      btnText  = 'Opłacono';
      onPress  = () => navigation.navigate('Payment');
    } else if (!payment) {
      btnStyle = styles.btnUnpaid;
      btnText  = '💸 Opłać';
      onPress  = () => handlePayment(item.id);
    } else if (isCompleted) {
      btnStyle = styles.btnCompleted;
      btnText  = 'Opłacono';
      onPress  = () => navigation.navigate('Payment');
    } else {
      btnStyle = styles.btnPaid;
      btnText  = 'Przejdź do płatności';
      onPress  = () => navigation.navigate('Payment');
    }

    return (
      <TouchableOpacity
        style={cardStyle}
        activeOpacity={isOrderPaid ? 1 : 0.8}
        onPress={() => navigation.navigate('Main')} // TU WSTAWIC PRZENIESIENIE DO EKRANU SZCZEGÓŁÓW
      >
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.cardStatus}>{item.status}</Text>
        </View>
        <Text style={styles.cardDate}>{formatDate(item.date)}</Text>
        <TouchableOpacity style={btnStyle} onPress={onPress} disabled={isOrderPaid}>
          <Text style={styles.btnText}>{btnText}</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <Ionicons name="list-outline" size={24} color="#007AFF" />
        <Text style={styles.topTitle}>Moje zlecenia</Text>
        <Ionicons
          name="close"
          size={28}
          color="#FF3B30"
          onPress={() => navigation.navigate('Main')}
        />
      </View>

      <PagerView
        style={styles.pager}
        initialPage={0}
        ref={pagerRef}
      >
        {/*Aktywne zlecenia*/}
        <View key="1" style={styles.page}>
          <Text style={styles.pageTitle}>🔹 Aktywne</Text>
          <FlatList
            data={dataActive}
            renderItem={renderCard}
            keyExtractor={item => String(item.id)}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/*historia zllecen */}
        <View key="2" style={styles.page}>
          <Text style={styles.pageTitle}>🔸 Historia</Text>
          <FlatList
            data={dataHistory}
            renderItem={renderCard}
            keyExtractor={item => String(item.id)}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </PagerView>

      <View style={styles.footer}>
        <TouchableOpacity onPress={() => pagerRef.current?.setPage(0)}>
          <Text style={styles.footerText}>Aktywne</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => pagerRef.current?.setPage(1)}>
          <Text style={styles.footerText}>Historia</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ListScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f7' },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#ffffff',
    elevation: 2,
  },
  topTitle: { fontSize: 18, fontWeight: '600', color: '#333' },

  pager: { flex: 1 },

  page: { flex: 1, paddingTop: 8 },
  pageTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginHorizontal: 16,
    marginBottom: 8,
    color: '#222',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },

  cardPaidOrder: {
    backgroundColor: '#FFA500',
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  cardStatus: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
  },
  cardDate: {
    marginTop: 8,
    fontSize: 13,
    color: '#666',
  },

  btnUnpaid: {
    marginTop: 12,
    backgroundColor: '#4caf50',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  btnPaid: {
    marginTop: 12,
    backgroundColor: '#2196f3',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  btnCompleted: {
    marginTop: 12,
    backgroundColor: '#FFD700',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontWeight: '600',
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e2e2',
  },
  footerText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#007AFF',
  },
});