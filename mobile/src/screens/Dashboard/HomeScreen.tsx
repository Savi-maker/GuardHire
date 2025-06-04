import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  Image, Modal, ScrollView, Animated, Easing
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { useTheme } from '../ThemeContext/ThemeContext';
import { useError } from '../Feedback/ErrorContext'; // ← DODANE
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getNews } from '../../utils/api';

type NewsType = { id: string, title: string, description: string };
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const HomeScreen: React.FC = () => {
  const { theme } = useTheme();
  const { setError } = useError(); // ← DODANE
  const navigation = useNavigation<NavigationProp>();
  const backgroundColor = theme === 'dark' ? '#303030' : '#ffffff';
  const textColor = theme === 'dark' ? '#ffffff' : '#000000';
  const [menuVisible, setMenuVisible] = useState(false);
  const [news, setNews] = useState<{ id: number, title: string, description: string }[]>([]);
  const [loading, setLoading] = useState(true);


  const actions = [
    { id: '1', title: 'Zlecenia', route: 'List' },
    { id: '2', title: 'Historia', route: 'OrderHistory' },
    { id: '3', title: 'Profil', route: 'UserProfile' },
    { id: '4', title: 'Powiadomienia', route: 'Notifications' },
    { id: '8', title: 'Szczegóły', route: 'Detail' },
    { id: '10', title: 'Formularz', route: 'Form' },
    { id: '11', title: 'Płatność', route: 'Payment' },
    {
      id: '12',
      title: 'Błąd',
      onPress: () => setError('To jest przykładowy komunikat błędu!')
    },
    { id: '13', title: 'Sukces', route: 'Success' },
    { id: '15', title: 'Wsparcie', route: 'HelpSupport' },
  ];

  

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

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.headerContainer}>
        <Image source={require('../../../assets/images/logo.png')} style={styles.image} />
        <TouchableOpacity style={styles.burger} onPress={() => setMenuVisible(true)}>
          <Ionicons name="menu" size={28} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.logoText, { color: '#ffffff' }]}>GuardHire</Text>
      </View>

      <Text style={[styles.sectionTitle, { color: textColor }]}>Aktualności</Text>
      <FlatList
        data={news}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderNewsItem}
        contentContainerStyle={{ paddingBottom: 20 }}
         ListEmptyComponent={<Text style={{ color: textColor, textAlign: 'center', margin: 15 }}>Brak newsów.</Text>}
      />

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
                    if (item.onPress) {
                      item.onPress(); // 🔥 globalny error
                    } else if (item.route) {
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
