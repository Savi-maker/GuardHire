import React, { useLayoutEffect, useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Linking,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PagerView from 'react-native-pager-view';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import {
  getPaymentList,
  payPayment,
  getMyProfile,
  confirmPayment
} from '../../utils/api';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Payment'>;

type PaymentItem = {
  id: string;
  orderName: string;
  amount: number;
  status: string;
  createdAt: string;
};

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

const PaymentScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const pagerRef = useRef<PagerView>(null);

  const [zaleglosci, setZaleglosci] = useState<PaymentItem[]>([]);
  const [historia, setHistoria] = useState<PaymentItem[]>([]);
  const [isAdmin, setIsAdmin] = useState(true);

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    (async () => {
      try {
        const profile = await getMyProfile();
        setIsAdmin(profile.role === 'admin');
      } catch {
        setIsAdmin(false);
      }

      try {
        const data = await getPaymentList();
        setZaleglosci(data.filter(i => i.status === 'pending'));
        setHistoria(data.filter(i => i.status !== 'pending'));
      } catch (err) {
        console.error('Błąd ładowania płatności:', err);
        Alert.alert('Błąd', 'Nie udało się pobrać danych płatności');
      }
    })();
  }, []);

  const handleOplac = async (id: string, amount: number) => {
    try {
      const response = await payPayment(id, 'janek@guardhire.pl');
      if (!response.ok) {
        const text = await response.text();
        console.error('Błąd odpowiedzi:', response.status, text);
        Alert.alert('Błąd', 'Nie udało się utworzyć płatności');
        return;
      }
      const { redirectUri }: { redirectUri?: string } = await response.json();
      if (redirectUri) {
        const can = await Linking.canOpenURL(redirectUri);
        if (can) await Linking.openURL(redirectUri);
        else Alert.alert('Błąd', 'Nie można otworzyć adresu płatności');
      } else {
        Alert.alert('Błąd', 'Brak redirectUri w odpowiedzi serwera');
      }
    } catch (err) {
      console.error('Błąd płatności:', err);
      Alert.alert('Błąd połączenia', 'Spróbuj ponownie później');
    }
  };

  const handleZatwierdz = async (id: string) => {
    const res = await confirmPayment(id);
    if (res.success) {
      Alert.alert('Sukces', 'Płatność zatwierdzona');
      const data = await getPaymentList();
      setZaleglosci(data.filter(i => i.status === 'pending'));
      setHistoria(data.filter(i => i.status !== 'pending'));
    } else {
      Alert.alert('Błąd', res.error || 'Nie udało się zatwierdzić');
    }
  };

  const renderCard = (
    item: PaymentItem,
    pageType: 'zaleglosci' | 'historia'
  ) => {
    const isPending = pageType === 'zaleglosci';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.orderName}
          </Text>
          <Text style={styles.cardStatus}>
            {isPending
              ? 'Oczekuje'
              : item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>

        <Text style={styles.cardAmount}>{item.amount.toFixed(2)} PLN</Text>
        <Text style={styles.cardDate}>{formatDate(item.createdAt)}</Text>

        {isPending ? (
          <>
            <TouchableOpacity
              style={styles.btnUnpaid}
              onPress={() => handleOplac(item.id, item.amount)}
            >
              <Text style={styles.btnText}>💸 Opłać</Text>
            </TouchableOpacity>
            {isAdmin && (
              <TouchableOpacity
                style={styles.btnTechConfirm}
                onPress={() => handleZatwierdz(item.id)}
              >
                <Text style={styles.btnText}>[TECH] Zatwierdź</Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <View style={styles.btnCompletedNonClickable}>
            <Text style={styles.btnText}>Opłacono</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.navigate('Main')}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Płatności</Text>
        <View style={{ width: 24 }} />
      </View>

      <PagerView style={styles.pager} initialPage={0} ref={pagerRef}>
        <View key="0" style={styles.page}>
          <Text style={styles.pageTitle}>🕓 Zaległości</Text>
          <FlatList
            data={zaleglosci}
            keyExtractor={i => i.id}
            renderItem={({ item }) => renderCard(item, 'zaleglosci')}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        </View>
        <View key="1" style={styles.page}>
          <Text style={styles.pageTitle}>✅ Historia</Text>
          <FlatList
            data={historia}
            keyExtractor={i => i.id}
            renderItem={({ item }) => renderCard(item, 'historia')}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </PagerView>

      <View style={styles.footer}>
        <TouchableOpacity onPress={() => pagerRef.current?.setPage(0)}>
          <Text style={styles.footerText}>Zaległości</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => pagerRef.current?.setPage(1)}>
          <Text style={styles.footerText}>Historia</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default PaymentScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f7' },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
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
  listContainer: { paddingHorizontal: 16, paddingBottom: 16 },

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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardTitle: { flex: 1, fontSize: 16, fontWeight: '600', color: '#111' },
  cardStatus: { fontSize: 14, fontWeight: '500', color: '#555' },
  cardAmount: { marginTop: 8, fontSize: 15, fontWeight: '500', color: '#333' },
  cardDate: { marginTop: 4, fontSize: 13, color: '#666' },

  btnUnpaid: {
    marginTop: 12,
    backgroundColor: '#4caf50',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  btnCompletedNonClickable: {
    marginTop: 12,
    backgroundColor: '#FFD700',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  btnTechConfirm: {
    marginTop: 8,
    backgroundColor: '#007AFF',
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: '600' },

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e2e2',
  },
  footerText: { fontSize: 16, fontWeight: '500', color: '#007AFF' },
});
