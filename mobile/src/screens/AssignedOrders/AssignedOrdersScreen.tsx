import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../ThemeContext/ThemeContext';
import { getOrders, getMyProfile, updateOrderStatus } from '../../utils/api';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ItemDetails'>;

const AssignedOrdersScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState<{ id: number; role: string } | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const user = await getMyProfile();
      setProfile(user);
      const data = await getOrders();
      const filtered = user.role === 'guard'
        ? data.filter((o: any) => o.assignedGuard === user.id)
        : data;
      setOrders(filtered);
    } catch (err) {
      console.error('Błąd ładowania zleceń:', err);
      setOrders([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const handleStatusChange = async (orderId: number, status: string) => {
    try {
      await updateOrderStatus(orderId.toString(), status);
      await fetchOrders();
    } catch (err) {
      console.error(`Błąd zmiany statusu: ${err}`);
    }
  };

  const getCardColor = (status: string) => {
    if (status === 'zakończone') return '#4caf50';
    if (status === 'anulowane') return '#f44336';
    return '#2196f3';
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity onPress={() => navigation.navigate('ItemDetails', { orderId: item.id })}>
      <View style={[styles.card, { backgroundColor: getCardColor(item.status) }]}>
        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.desc}>{item.opis}</Text>
        <Text style={styles.date}>{new Date(item.date).toLocaleString()}</Text>
        <View style={styles.btnRow}>
          {item.status !== 'zakończone' && item.status !== 'anulowane' && (
            <>
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: '#4caf50' }]}
                onPress={() => handleStatusChange(item.id, 'zakończone')}
              >
                <Text style={styles.btnText}>Zakończ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: '#f44336' }]}
                onPress={() => handleStatusChange(item.id, 'anulowane')}
              >
                <Text style={styles.btnText}>Anuluj</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[
      styles.container,
      { backgroundColor: theme === 'dark' ? '#303030' : '#f2f2f2' }
    ]}>
      <FlatList
        data={orders}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>Brak zleceń do wyświetlenia</Text>
        }
      />
    </SafeAreaView>
  );
};

export default AssignedOrdersScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: {
    margin: 10,
    padding: 15,
    borderRadius: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  desc: {
    fontSize: 14,
    color: '#eee',
    marginTop: 4,
  },
  date: {
    fontSize: 12,
    color: '#ddd',
    marginTop: 6,
  },
  btnRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  btn: {
    padding: 8,
    borderRadius: 6,
    marginRight: 10,
  },
  btnText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 16,
    color: '#888',
  },
});
