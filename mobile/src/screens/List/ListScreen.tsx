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

//TABELE MODUŁU Kontakty mockup
const dataContact = [
  {id: '1', name: 'Janusz Kowalski', rate: '1', phone: '123456789'},
  {id: '2', name: 'Sebastian Blok', rate: '3', phone: '123456789'}
];

const dataLastContact = [
  {id: '1', name: 'Andrzej Box', rate: '9', phone: '123456789'},
  {id: '2', name: 'Leon King', rate: '10', phone: '123456789'}
];




type TabType = 'active' | 'history';
type ContactTabType = 'contacts' | 'popular';


const ListScreen: React.FC = () => {

const [currentTab, setCurrentTab] = useState<TabType>('active');
const [ContactTab, setContactTab] = useState<ContactTabType>('contacts');
const [selectedModule, setSelectedModule] = useState<'Zlecenia' | 'Kontakty'>('Zlecenia');
const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();


const [dataActive, setDataActive] = useState<any[]>([]);
const [dataHistory, setDataHistory] = useState<any[]>([]);

useEffect(() => {
  fetch('http://192.168.0.19:3000/orders')
    .then(res => res.json())
    .then(data => {
      const active = data.filter((o: any) => o.status !== 'zakończone' && o.status !== 'anulowane');
      const history = data.filter((o: any) => o.status === 'zakończone' || o.status === 'anulowane');
      setDataActive(active);
      setDataHistory(history);
    })
    .catch(err => console.error('Błąd ładowania zleceń:', err));
}, []);


  const renderItem = ({ item }: { item: typeof dataActive[0] }) => (
    <View style={styles.row}>
      <Text style={styles.cell}>{item.name}</Text>
      <Text style={styles.cell}>{item.status}</Text>
      <Text style={styles.cell}>{formatDate(item.date)}</Text>
    </View>
  );

  //RENDER TABELI DO MODUŁU Zlecenia
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

//RENDER TABELI DO MODUŁU Test
const renderTestTable = () => {
  const data = ContactTab === 'contacts' ? dataContact: dataLastContact;
  const title = ContactTab === 'contacts' ? '📄 Kontakty' : '📑 Najpopularniejsze kontakty';

  return (
    <>
      <Text style={styles.sectionTitle}>{title}</Text>
       <View style={styles.table}></View>
       <View style={styles.header}>
      <Text style={styles.headerCell}>Nazwa</Text>
            <Text style={styles.headerCell}>Ocena</Text>
            <Text style={styles.headerCell}>Numer</Text>
            </View>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.cell}>{item.name}</Text>
            <Text style={styles.cell}>{item.rate}</Text>
            <Text style={styles.cell}>{item.phone}</Text>
            
          </View>
        )}
      />
    </>
  );
};



const renderModuleView = () => {
  if (selectedModule === 'Zlecenia') {
    return renderTable(); 
  }

  if (selectedModule === 'Kontakty') {
    return renderTestTable();
   
  }

  return null;
};




  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Góra - wybór modułu */}
      <View style={styles.topBar}>
        <TouchableOpacity 
        style={styles.moduleButton}
       onPress={() => setSelectedModule(prev => (prev === 'Zlecenia' ? 'Kontakty' : 'Zlecenia'))} >
          <Ionicons name="list-outline" size={20} color="#007AFF" />
          <Text style={styles.moduleButtonText}>{selectedModule}</Text>
        </TouchableOpacity>

 {/* Wyjście do ekranu głównego */}
        <TouchableOpacity onPress={() => navigation.navigate('Main')}>
          <Ionicons name="close" size={28} color="#FF3B30" />
        </TouchableOpacity>
      </View>

    
      {/* Przyciski nawigujące - do sterowania widocznością tabel */}

<View style={styles.contentContainer}>
  {renderModuleView()}
</View>
{selectedModule === 'Zlecenia' && (
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
)}


{selectedModule === 'Kontakty' && (
  <View style={styles.bottomNav}>
    <TouchableOpacity
      style={[styles.navButton, ContactTab === 'contacts' && styles.navButtonActive]}
      onPress={() => setContactTab('contacts')}
    >
      <Text style={styles.navText}>Kontakty</Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={[styles.navButton, ContactTab === 'popular' && styles.navButtonActive]}
      onPress={() => setContactTab('popular')}
    >
      <Text style={styles.navText}>Najpopularniejsze Kontakty</Text>
    </TouchableOpacity>
  </View>
)}

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
