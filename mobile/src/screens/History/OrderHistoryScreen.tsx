import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity
} from 'react-native';
import { useTheme } from '../ThemeContext/ThemeContext';
import { getOrders } from '../../utils/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const OrderHistoryScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCompletedOrders = async () => {
    setLoading(true);
    try {
      const allOrders = await getOrders();
      const completed = Array.isArray(allOrders)
        ? allOrders.filter(o => o.status === 'zakończone')
        : [];
      setOrders(completed);
    } catch {
      setOrders([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCompletedOrders();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCompletedOrders();
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('ItemDetails', { orderId: item.id })}
    >
      <View
        style={[
          styles.card,
          { backgroundColor: theme === 'dark' ? '#424242' : '#fff' }
        ]}
      >
        <Text style={[
          styles.title,
          { color: theme === 'dark' ? '#fff' : '#000' }
        ]}>{item.name}</Text>
        <Text style={{ color: theme === 'dark' ? '#ccc' : '#555' }}>{item.opis}</Text>
        <Text style={{ fontSize: 12, color: theme === 'dark' ? '#aaa' : '#888' }}>
          {new Date(item.date).toLocaleString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[
      styles.safeContainer,
      { backgroundColor: theme === 'dark' ? '#303030' : '#f2f2f2' }
    ]}>
      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <Text style={{
              textAlign: 'center',
              marginTop: 40,
              color: theme === 'dark' ? '#aaa' : '#888'
            }}>
              Brak zakończonych zleceń
            </Text>
          }
          contentContainerStyle={orders.length === 0 ? { flex: 1, justifyContent: 'center' } : undefined}
        />
      )}
    </SafeAreaView>
  );
};

export default OrderHistoryScreen;

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1
  },
  card: {
    marginHorizontal: 12,
    marginVertical: 8,
    padding: 16,
    borderRadius: 10,
    elevation: 2
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4
  }
});
