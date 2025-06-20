import React, { useLayoutEffect, useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Linking,
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
import { useTheme } from '../ThemeContext/ThemeContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Payment'>;

type PaymentItem = {
  id: string;
  orderName: string;
  amount: number;
  status: string;
  createdAt: string;
};

const PaymentScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const pagerRef = useRef<PagerView>(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [zaleglosci, setZaleglosci] = useState<PaymentItem[]>([]);
  const [historia, setHistoria] = useState<PaymentItem[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    (async () => {
      try {
        const profile = await getMyProfile();
        setIsAdmin(profile.role === 'admin');
        setUserId(profile.id);
        const data = await getPaymentList(profile.id, profile.role);
        setZaleglosci(data.filter((item: PaymentItem) => item.status === 'pending'));
        setHistoria(data.filter((item: PaymentItem) => item.status !== 'pending'));
      } catch (err) {
        Alert.alert('Błąd', 'Nie udało się pobrać danych płatności');
      }
    })();
  }, []);

  const handleOplac = async (id: string, amount: number) => {
    try {
      const response = await payPayment(id, 'janek@guardhire.pl');
      if (!response.ok) {
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
    } catch {
      Alert.alert('Błąd połączenia', 'Spróbuj ponownie później');
    }
  };

  const handleZatwierdz = async (id: string) => {
    const res = await confirmPayment(id);
    if (res.success) {
      Alert.alert('Sukces', 'Płatność zatwierdzona');
      const profile = await getMyProfile();
      const data = await getPaymentList(profile.id, profile.role);
      setZaleglosci(data.filter((item: PaymentItem) => item.status === 'pending'));
      setHistoria(data.filter((item: PaymentItem) => item.status !== 'pending'));
    } else {
      Alert.alert('Błąd', res.error || 'Nie udało się zatwierdzić');
    }
  };

  const formatDate = (isoString: string): string => {
    const date = new Date(isoString);
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const MM = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${hh}:${mm}  ${dd}.${MM}.${yyyy}`;
  };

  const renderCard = (
    item: PaymentItem,
    pageType: 'zaleglosci' | 'historia'
  ) => {
    const isPending = pageType === 'zaleglosci';

    return (
      <TouchableOpacity
        style={[
          styles.card,
          { backgroundColor: isDark ? '#232323' : '#fff' }
        ]}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('ItemDetails', { orderId: Number(item.id) })}
      >
        <View style={styles.cardHeader}>
          <Text style={[
            styles.cardTitle,
            { color: isDark ? '#fff' : '#111' }
          ]} numberOfLines={1}>
            {item.orderName}
          </Text>
          <Text style={[
            styles.cardStatus,
            { color: isDark ? '#e7c24f' : '#555' }
          ]}>
            {isPending
              ? 'Oczekuje'
              : item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
        <Text style={[
          styles.cardAmount,
          { color: isDark ? '#fff' : '#333' }
        ]}>{item.amount.toFixed(2)} PLN</Text>
        <Text style={[
          styles.cardDate,
          { color: isDark ? '#aaa' : '#666' }
        ]}>{formatDate(item.createdAt)}</Text>
        {isPending ? (
          <>
            <TouchableOpacity
              style={[styles.btnUnpaid, { backgroundColor: isDark ? '#388e3c' : '#4caf50' }]}
              onPress={() => handleOplac(item.id, item.amount)}
            >
              <Text style={styles.btnText}>💸 Opłać</Text>
            </TouchableOpacity>
            {isAdmin && (
              <TouchableOpacity
                style={[styles.btnTechConfirm, { backgroundColor: isDark ? '#2196f3' : '#007AFF' }]}
                onPress={() => handleZatwierdz(item.id)}
              >
                <Text style={styles.btnText}>[TECH] Zatwierdź</Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <View style={[styles.btnCompletedNonClickable, { backgroundColor: isDark ? '#857602' : '#FFD700' }]}>
            <Text style={styles.btnText}>Opłacono</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[
      styles.container,
      { backgroundColor: isDark ? '#191919' : '#f2f2f7' }
    ]}>
      <View style={[
        styles.topBar,
        { backgroundColor: isDark ? '#232323' : '#fff' }
      ]}>
        <TouchableOpacity onPress={() => navigation.navigate('Main')}>
          <Ionicons name="arrow-back" size={24} color={isDark ? "#9fcaff" : "#007AFF"} />
        </TouchableOpacity>
        <Text style={[
          styles.topTitle,
          { color: isDark ? "#fff" : "#333" }
        ]}>Płatności</Text>
        <View style={{ width: 24 }} />
      </View>
      <PagerView style={styles.pager} initialPage={0} ref={pagerRef}>
        <View key="0" style={styles.page}>
          <Text style={[
            styles.pageTitle,
            { color: isDark ? "#fff" : "#222" }
          ]}>🕓 Zaległości</Text>
          <FlatList
            data={zaleglosci}
            keyExtractor={(i: PaymentItem) => i.id}
            renderItem={({ item }) => renderCard(item, 'zaleglosci')}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        </View>
        <View key="1" style={styles.page}>
          <Text style={[
            styles.pageTitle,
            { color: isDark ? "#fff" : "#222" }
          ]}>✅ Historia</Text>
          <FlatList
            data={historia}
            keyExtractor={(i: PaymentItem) => i.id}
            renderItem={({ item }) => renderCard(item, 'historia')}
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
          <Text style={[styles.footerText, { color: isDark ? '#9fcaff' : '#007AFF' }]}>Zaległości</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => pagerRef.current?.setPage(1)}>
          <Text style={[styles.footerText, { color: isDark ? '#9fcaff' : '#007AFF' }]}>Historia</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default PaymentScreen;

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
  listContainer: { paddingHorizontal: 16, paddingBottom: 16 },
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardTitle: { flex: 1, fontSize: 16, fontWeight: '600' },
  cardStatus: { fontSize: 14, fontWeight: '500' },
  cardAmount: { marginTop: 8, fontSize: 15, fontWeight: '500' },
  cardDate: { marginTop: 4, fontSize: 13 },
  btnUnpaid: {
    marginTop: 12,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  btnCompletedNonClickable: {
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  btnTechConfirm: {
    marginTop: 8,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: '600' },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  footerText: { fontSize: 16, fontWeight: '500' },
});
