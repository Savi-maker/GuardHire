import React, { useState,useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, Modal, ScrollView, Animated, Easing } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { useTheme } from '../ThemeContext/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const actions = [
  { id: '1', title: 'Zlecenia', route: 'List' },
  { id: '2', title: 'Historia', route: 'OrderHistory' },
  { id: '3', title: 'Profil', route: 'UserProfile' },
  { id: '4', title: 'Powiadomienia', route: 'Notifications' },
  //{ id: '5', title: 'Logowanie', route: 'Login' },
 // { id: '6', title: 'Rejestracja', route: 'Register' },
 // { id: '7', title: 'Reset Hasła', route: 'ResetPassword' },
  { id: '8', title: 'Szczegóły', route: 'Detail' },
//  { id: '9', title: 'Wyszukaj', route: 'Search' },
  { id: '10', title: 'Formularz', route: 'Form' },
  { id: '11', title: 'Płatność', route: 'Payment' },
  { id: '12', title: 'Błąd', route: 'Error' },
  { id: '13', title: 'Sukces', route: 'Success' },
 // { id: '14', title: 'Ustawienia', route: 'Settings' },
  { id: '15', title: 'Wsparcie', route: 'HelpSupport' },
//  { id: '16', title: 'Start', route: 'Home' },
];

const news = [
  {
    id: 'n1',
    title: 'Nowe zlecenie dostępne',
    description: 'Sprawdź nowe zlecenie w Twoim rejonie. Zarób dodatkowe środki już dziś!',
  },
  {
    id: 'n2',
    title: 'Aktualizacja aplikacji',
    description: 'Wersja 2.0 już dostępna. Sprawdź nowe funkcje i ulepszenia.',
  },
  {
    id: 'n3',
    title: 'Bezpieczeństwo',
    description:
      'Przypomnienie o zasadach bezpieczeństwa podczas pracy. Twoje zdrowie jest najważniejsze.',
  },
];


  const HomeScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const backgroundColor = theme === 'dark' ? '#303030' : '#ffffff';
  const textColor = theme === 'dark' ? '#ffffff' : '#000000';
  const [menuVisible, setMenuVisible] = useState(false);

  const renderNewsItem = ({ item }: { item: typeof news[0] }) => (
    <View style={[styles.newsCard, { backgroundColor: theme === 'dark' ? '#424242' : '#f2f2f2' }]}>
      <Text style={[styles.newsTitle, { color: textColor }]}>{item.title}</Text>
      <Text style={[styles.newsDesc, { color: textColor }]}>
        {item.description.length > 100
          ? item.description.substring(0, 100) + '...'
          : item.description}
      </Text>
    </View>
  );

const slideAnim = useRef(new Animated.Value(300)).current;

useEffect(() => {
  if (menuVisible) {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  } else {
    Animated.timing(slideAnim, {
      toValue: 300,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }
}, [menuVisible]);

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.headerContainer}>
       <Image source={require('../../../assets/images/logo.png')} style={styles.image} />

        <TouchableOpacity style={styles.burger} onPress={() => setMenuVisible(true)}>
          <Ionicons name="menu" size={28} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.logoText, { color: '#ffffff' }]}>GuardHire</Text>
      </View>

      {/*aktualnosci*/}
      <Text style={[styles.sectionTitle, { color: textColor }]}>Aktualności</Text>
      <FlatList
        data={news}
        keyExtractor={(item) => item.id}
        renderItem={renderNewsItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      {/*menu*/}
      <Modal transparent visible={menuVisible} animationType="none">
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setMenuVisible(false)}
          activeOpacity={1}
        >
         <View style={[styles.menuContainer, { backgroundColor: theme === 'dark' ? '#404040E6' : '#ffffffE6' }]}>
            <ScrollView contentContainerStyle={styles.menuScroll}>
              {actions.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.menuItem}
                  onPress={() => {
                    setMenuVisible(false);
                    navigation.navigate(item.route as any);
                  }}
                >
                  <Text style={[styles.menuText, { color: textColor }]}>{item.title}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <SafeAreaView edges={['bottom']} style={styles.safeLoginContainer}>
              <TouchableOpacity
                style={styles.loginButton}
                onPress={() => {
                  setMenuVisible(false);
                  navigation.navigate('Login');
                }}
              >
                <Text style={[styles.loginText, { color: textColor }]}>Logowanie</Text>
              </TouchableOpacity>
            </SafeAreaView>

          </View>

        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    position: 'relative',
    height: '25%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  burger: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
  },
  logoText: {
    position: 'absolute',
    bottom: 10,
    fontSize: 24,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    margin: 15,
  },
  newsCard: {
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 15,
    borderRadius: 10,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  newsDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    width: '80%',
    height: '100%',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  menuScroll: {
    paddingBottom: 40,
  },
  menuItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc44',
  },
  menuText: {
    fontSize: 16,
  },
  loginButton: {
  paddingVertical: 20,
  borderTopWidth: 1,
  borderTopColor: '#cccccc44',
  alignItems: 'center',
},
loginText: {
  fontSize: 16,
  fontWeight: '600',
},
safeLoginContainer: {
  backgroundColor: 'transparent',
},
});
