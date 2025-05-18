import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { useTheme } from '../ThemeContext/ThemeContext';
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const actions = [
  { id: '1', title: 'Zlecenia', route: 'List' },
  { id: '2', title: 'Historia', route: 'OrderHistory' },
  { id: '3', title: 'Profil', route: 'UserProfile' },
  { id: '4', title: 'Powiadomienia', route: 'Notifications' },
  { id: '5', title: 'Logowanie', route: 'Login' },
  { id: '6', title: 'Rejestracja', route: 'Register' },
  { id: '7', title: 'Reset Hasła', route: 'ResetPassword' },
  { id: '8', title: 'Szczegóły', route: 'Detail' },
  { id: '9', title: 'Wyszukaj', route: 'Search' },
  { id: '10', title: 'Formularz', route: 'Form' },
  { id: '11', title: 'Płatność', route: 'Payment' },
  { id: '12', title: 'Błąd', route: 'Error' },
  { id: '13', title: 'Sukces', route: 'Success' },
  { id: '14', title: 'Ustawienia', route: 'Settings' },
  { id: '15', title: 'Wsparcie', route: 'HelpSupport' },
  { id: '16', title: 'Start', route: 'Home' },
];

const HomeScreen: React.FC = () => {
  const { theme } = useTheme();
  const backgroundColor = theme === 'dark' ? '#303030' : '#ffffff';
  const textColor = theme === 'dark' ? '#ffffff' : '#000000';
  const navigation = useNavigation<NavigationProp>();

  const renderItem = ({ item }: { item: typeof actions[0] }) => (
  <TouchableOpacity
    style={[styles.card, { backgroundColor: theme === 'dark' ? '#424242' : '#fff' }]}
    onPress={() => navigation.navigate(item.route as any)}
  >
    <Text style={[styles.cardText, { color: textColor }]}>{item.title}</Text>
  </TouchableOpacity>
);


  return (
      <View style={[styles.container, { backgroundColor }]}>
      <Text style={[styles.header, { color: textColor }]}>Witaj w GuardHire 👋</Text>
      <Text style={[styles.subheader, { color: textColor }]}>Co chcesz dzisiaj zrobić?</Text>


      <FlatList
        data={actions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: '#f4f4f4',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subheader: {
    fontSize: 16,
    marginBottom: 20,
    color: '#666',
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    marginHorizontal: 5,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
  },
  cardText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
