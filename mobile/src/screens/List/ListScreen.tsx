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
  updateOrderStatus,
  getMyProfile,
  getMyOrders
} from '../../utils/api';
import { useTheme } from '../ThemeContext/ThemeContext';

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
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const profile = await getMyProfile();
      const userId = profile.id;
      const role = profile.role;
      let orders: any[] = [];
      if (role === 'admin') {
        orders = await getOrders(userId, role);
      } else if (role === 'user') {
        orders = await getMyOrders(userId);
      } else {
        orders = await getOrders(userId, role);
      }
      const pays = await getPaymentList(userId, role);

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
      await manualCreatePayment(orderId);
      await updateOrderStatus(orderId, 'w trakcie');
    } catch (e) {
      console.warn('Błąd płatności:', e);
    } finally {
      fetchAll();
      setTimeout(() => navigation.navigate('Payment'), 100);
    }
  };

  const renderCard = ({ item }: { item: any }) => {
    const payment = payments.find(p => String(p.orderId) === String(item.id));
    const isCompleted = payment?.status === 'completed';
    const isOrderPaid = item.status === 'Opłacono';

    const cardStyle = [
      styles.card,
      { backgroundColor: isOrderPaid ? (isDark ? '#665002' : '#FFA500') : (isDark ? '#232323' : '#fff') }
    ];

    let btnStyle, btnText, onPress;
    if (isOrderPaid) {
      btnStyle = [styles.btnCompleted, { backgroundColor: isDark ? '#857602' : '#FFD700' }];
      btnText = 'Opłacono';
      onPress = () => navigation.navigate('Payment');
    } else if (!payment) {
      btnStyle = [styles.btnUnpaid, { backgroundColor: isDark ? '#388e3c' : '#4caf50' }];
      btnText = '💸 Opłać';
      onPress = () => handlePayment(item.id);
    } else if (isCompleted) {
      btnStyle = [styles.btnCompleted, { backgroundColor: isDark ? '#857602' : '#FFD700' }];
      btnText = 'Opłacono';
      onPress = () => navigation.navigate('Payment');
    } else {
      btnStyle = [styles.btnPaid, { backgroundColor: isDark ? '#1976d2' : '#2196f3' }];
      btnText = 'Przejdź do płatności';
      onPress = () => navigation.navigate('Payment');
    }

    return (
      <TouchableOpacity
        style={cardStyle}
        activeOpacity={isOrderPaid ? 1 : 0.8}
        onPress={() => navigation.navigate('Main')}
      >
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: isDark ? '#fff' : '#111' }]} numberOfLines={1}>{item.name}</Text>
          <Text style={[styles.cardStatus, { color: isDark ? '#ffe082' : '#555' }]}>{item.status}</Text>
        </View>
        <Text style={[styles.cardDate, { color: isDark ? '#aaa' : '#666' }]}>{formatDate(item.date)}</Text>
        <TouchableOpacity style={btnStyle} onPress={onPress} disabled={isOrderPaid}>
          <Text style={styles.btnText}>{btnText}</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[
      styles.container,
      { backgroundColor: isDark ? '#191919' : '#f2f2f7' }
    ]} edges={['top']}>
      <View style={[
        styles.topBar,
        { backgroundColor: isDark ? '#232323' : '#ffffff' }
      ]}>
        <Ionicons name="list-outline" size={24} color={isDark ? '#82b1ff' : '#007AFF'} />
        <Text style={[styles.topTitle, { color: isDark ? '#fff' : '#333' }]}>Moje Płatności</Text>
        <Ionicons
          name="close"
          size={28}
          color={isDark ? "#FF8888" : "#FF3B30"}
          onPress={() => navigation.navigate('Main')}
        />
      </View>
      <PagerView
        style={styles.pager}
        initialPage={0}
        ref={pagerRef}
      >
        <View key="1" style={styles.page}>
          <Text style={[styles.pageTitle, { color: isDark ? "#fff" : "#222" }]}>🔹 Aktywne</Text>
          <FlatList
            data={dataActive}
            renderItem={renderCard}
            keyExtractor={item => String(item.id)}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        </View>
        <View key="2" style={styles.page}>
          <Text style={[styles.pageTitle, { color: isDark ? "#fff" : "#222" }]}>🔸 Historia</Text>
          <FlatList
            data={dataHistory}
            renderItem={renderCard}
            keyExtractor={item => String(item.id)}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </PagerView>
      <View style={[
        styles.footer,
        { backgroundColor: isDark ? '#232323' : '#fff', borderTopColor: isDark ? '#444' : '#e2e2e2' }
      ]}>
        <TouchableOpacity onPress={() => pagerRef.current?.setPage(0)}>
          <Text style={[styles.footerText, { color: isDark ? '#82b1ff' : '#007AFF' }]}>Aktywne</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => pagerRef.current?.setPage(1)}>
          <Text style={[styles.footerText, { color: isDark ? '#82b1ff' : '#007AFF' }]}>Historia</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ListScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    elevation: 2,
  },
  topTitle: { fontSize: 18, fontWeight: '600' },
  pager: { flex: 1 },
  page: { flex: 1, paddingTop: 8 },
  pageTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  card: {
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
  },
  cardStatus: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  cardDate: {
    marginTop: 8,
    fontSize: 13,
  },
  btnUnpaid: {
    marginTop: 12,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  btnPaid: {
    marginTop: 12,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  btnCompleted: {
    marginTop: 12,
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
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  footerText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
