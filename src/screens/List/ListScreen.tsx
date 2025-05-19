import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';

const dataActive = [
  { id: '1', name: 'Zlecenie A', status: 'Aktywne', date: '2024-05-01' },
  { id: '2', name: 'Zlecenie B', status: 'Oczekujące', date: '2024-05-03' },
];

const dataHistory = [
  { id: '1', name: 'Zlecenie X', status: 'Zakończone', date: '2024-04-20' },
  { id: '2', name: 'Zlecenie Y', status: 'Anulowane', date: '2024-04-21' },
];

type TabType = 'active' | 'history';

const ListScreen: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<TabType>('active');
  const [selectedModule, setSelectedModule] = useState('Zlecenia');
const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const renderItem = ({ item }: { item: typeof dataActive[0] }) => (
    <View style={styles.row}>
      <Text style={styles.cell}>{item.name}</Text>
      <Text style={styles.cell}>{item.status}</Text>
      <Text style={styles.cell}>{item.date}</Text>
    </View>
  );

  const renderTable = () => {
    const data = currentTab === 'active' ? dataActive : dataHistory;
    const title = currentTab === 'active' ? '🔹 Aktywne zlecenia' : '🔸 Historia zleceń';

    return (
      <>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.table}>
          <View style={styles.header}>
            <Text style={styles.headerCell}>Nazwa</Text>
            <Text style={styles.headerCell}>Status</Text>
            <Text style={styles.headerCell}>Data</Text>
          </View>
          <FlatList
            data={data}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
          />
        </View>
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Pasek górny z przyciskiem wyboru */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.moduleButton}>
          <Ionicons name="list-outline" size={20} color="#007AFF" />
          <Text style={styles.moduleButtonText}>{selectedModule}</Text>
        </TouchableOpacity>

 {/* Prawy przycisk - powrót do Home */}
        <TouchableOpacity onPress={() => navigation.navigate('Main')}>
          <Ionicons name="close" size={28} color="#FF3B30" />
        </TouchableOpacity>
      </View>

      {/* Lista */}
      <View style={styles.contentContainer}>{renderTable()}</View>

      {/* Dolna nawigacja */}
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
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 4,
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
  table: {
    marginBottom: 24,
  },
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
  },
  cell: {
    flex: 1,
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
