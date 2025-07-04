import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  Image, Modal, ScrollView, Animated, Easing
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { useTheme } from '../ThemeContext/ThemeContext';
import { useError } from '../Feedback/ErrorContext'; 
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getNews } from '../../utils/api';
import DetailScreen from '../Details/DetailScreen';
import { getToken, removeToken, getMyProfile, deleteNews, editNews } from '../../utils/api';

type NewsType = { id: number, title: string, description: string };
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const HomeScreen: React.FC = () => {
  const { theme } = useTheme();
  const { setError } = useError();
  const navigation = useNavigation<NavigationProp>();
  const backgroundColor = theme === 'dark' ? '#303030' : '#ffffff';
  const textColor = theme === 'dark' ? '#ffffff' : '#000000';
  const [menuVisible, setMenuVisible] = useState(false);
  const [news, setNews] = useState<NewsType[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedNews, setSelectedNews] = useState<NewsType | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  // ALERT
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{ title: string; message: string; type: 'error' | 'success' }>({
    title: '',
    message: '',
    type: 'error'
  });
  const showModal = (title: string, message: string, type: 'error' | 'success') => {
    setAlertConfig({ title, message, type });
    setAlertVisible(true);
  };

  // ACTIONS
  const actions = [
    { id: '1', title: 'Płatności', route: 'List' },
    { id: '2', title: 'Historia zleceń', route: 'OrderHistory' },
    { id: '3', title: 'Profil', route: 'UserProfile' },
    { id: '4', title: 'Powiadomienia', route: 'Notifications' },
    ...(userRole === 'user' || userRole === 'admin' ? [
      { id: '10', title: 'Dodaj zlecenie', route: 'Form' },
    ] : []),
    { id: '11', title: 'Zlecenia', route: 'Payment' },
    ...(userRole === 'guard' ? [
      { id: '14', title: 'Dodaj raport', route: 'AddRaport' },
    ] : []),
    ...(userRole === 'guard' || userRole === 'user' ? [
      { id: '15', title: 'Twoje Raporty', route: 'UserRaports' },
    ] : []),
    ...(userRole === 'admin' ? [
      { id: '16', title: 'Wszystkie Raporty', route: 'Raport' },
    ] : []),
    { id: '17', title: 'Twoja lokalizacja', route: 'CurrentLocation' },
    ...(userRole === 'guard' || userRole === 'admin' ? [
      { id: '18', title: 'Zlecenia przypisane', route: 'AssignedOrders' },
    ] : []),
    ...(userRole === 'admin' ? [
      { id: '20', title: 'Panel Admina', route: 'AdminPanel' },
    ] : []),
  ];

  // HANDLERS
  const handleDelete = async (id: number) => {
    try {
      setModalVisible(false);
      await deleteNews(id.toString());
      setNews(news.filter(n => n.id !== id));
    } catch (error) {
      setError('Błąd podczas usuwania aktualności.');
    }
  };

  const handleEdit = async (id: number, title: string, description: string) => {
    try {
      setModalVisible(false);
      await editNews(id.toString(), title, description);
      setNews(news.map(n => n.id === id ? { ...n, title, description } : n));
      setError('');
    } catch (error) {
      setError('Błąd podczas edycji aktualności.');
    }
  };

  // PROFILE & TOKEN
  useEffect(() => {
    const check = async () => {
      const token = await getToken();
      setIsLoggedIn(!!token);

      if (token) {
        try {
          const profile = await getMyProfile();
          setUserRole(profile.role);
        } catch {
          setUserRole(null);
        }
      } else {
        setUserRole(null);
      }
    };
    check();
  }, []);

  // NEWS
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    getNews()
      .then(data => {
        if (isMounted) setNews(data);
      })
      .catch(() => setError('Błąd ładowania newsów'))
      .finally(() => setLoading(false));
    return () => { isMounted = false; };
  }, []);

  // ANIMATION
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

  // LOGOUT
  const handleLogout = async () => {
    try {
      await removeToken();
      setIsLoggedIn(false);
      setUserRole(null);
      setMenuVisible(false);
      showModal('Sukces', 'Wylogowano pomyślnie!', 'success');
    } catch (error) {
      showModal('Błąd', 'Wystąpił nieoczekiwany błąd. Spróbuj ponownie.', 'error');
    }
  };

  // RENDER
  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.headerContainer}>
        <Image source={require('../../../assets/images/logo.png')} style={styles.image} />
        {isLoggedIn ? (
          <TouchableOpacity style={styles.burger} onPress={() => setMenuVisible(true)}>
            <Ionicons name="menu" size={28} color={textColor} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.burger, { backgroundColor: 'transparent' }]}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={{ color: textColor, fontWeight: 'bold', fontSize: 16 }}>Logowanie</Text>
          </TouchableOpacity>
        )}
        <Text style={[styles.logoText, { color: '#ffffff' }]}>GuardHire</Text>
      </View>

      <Text style={[styles.sectionTitle, { color: textColor }]}>Aktualności</Text>
      <FlatList
        data={news}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.newsCard, { backgroundColor: theme === 'dark' ? '#424242' : '#f2f2f2' }]}
            onPress={() => {
              setSelectedNews(item);
              setModalVisible(true);
            }}
            activeOpacity={0.8}
          >
            <Text style={[styles.newsTitle, { color: textColor }]}>{item.title}</Text>
            <Text style={[styles.newsDesc, { color: textColor }]}>
              {item.description.length > 100
                ? item.description.substring(0, 100) + '...'
                : item.description}
            </Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={<Text style={{ color: textColor, textAlign: 'center', margin: 15 }}>Brak newsów.</Text>}
      />

      <DetailScreen
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        news={selectedNews || { id: 0, title: '', description: '' }}
        onDelete={handleDelete}
        onEdit={handleEdit}
        role={userRole ?? undefined}
      />

      <Modal transparent visible={isLoggedIn && menuVisible} animationType="none">
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
                    if (item.route) {
                      navigation.navigate(item.route as any);
                    }
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
                  if (isLoggedIn) {
                    handleLogout();
                  } else {
                    setMenuVisible(false);
                    navigation.navigate('Login');
                  }
                }}
              >
                <Text style={[styles.loginText, { color: textColor }]}>
                  {isLoggedIn ? 'Wyloguj' : 'Logowanie'}
                </Text>
              </TouchableOpacity>
            </SafeAreaView>
          </View>
        </TouchableOpacity>
      </Modal>
      {/* ALERT */}
      {/* ... CustomAlert, etc ... */}
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
    width: '70%',
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
    fontSize: 17,
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

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    padding: 15,
    alignItems: 'center',
  },
  errorHeader: {
    backgroundColor: '#ff6b6b',
  },
  successHeader: {
    backgroundColor: '#51cf66',
  },
  title: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  body: {
    padding: 20,
    alignItems: 'center',
  },
  message: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  button: {
    padding: 15,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  errorButton: {
    backgroundColor: '#fff0f0',
  },
  successButton: {
    backgroundColor: '#f0fff0',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});