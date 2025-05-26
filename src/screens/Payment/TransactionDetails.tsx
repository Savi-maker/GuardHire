import React, { useLayoutEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../navigation/types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type TransactionDetailsRouteProp = RouteProp<RootStackParamList, 'TransactionDetails'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'TransactionDetails'>;

const TransactionDetails: React.FC = () => {
  const route = useRoute<TransactionDetailsRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { transactionId } = route.params;

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Szczegóły transakcji',
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.navigate('Payment')} style={{ marginRight: 16 }}>
          <Text style={{ color: '#007AFF', fontWeight: 'bold' }}>💸 Płatności</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.detail}>ID Transakcji: {transactionId}</Text>
      <Text style={styles.detail}>Kwota: 100.00 PLN</Text>
      <Text style={styles.detail}>Data: 2024-05-01</Text>
      <Text style={styles.detail}>Status: Zakończona</Text>
    </View>
  );
};

export default TransactionDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  detail: {
    fontSize: 16,
    marginBottom: 10,
  },
});
