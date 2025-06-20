import React, { useEffect, useState } from 'react';
import { View, Text, Switch, StyleSheet, SafeAreaView, TouchableOpacity, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../ThemeContext/ThemeContext';
import { LightSensor } from 'expo-sensors';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';

const SETTINGS_KEY = 'app_settings';

const defaultSettings = {
  themeMode: 'auto',
  notificationsEnabled: true,
  language: 'en',
};

const LIGHT_THRESHOLD = 40;
const LANGUAGES = [
  { label: 'Polski', value: 'pl' },
  { label: 'English', value: 'en' },
];
const THEMES = [
  { label: 'Ciemny', value: 'on' },
  { label: 'Jasny', value: 'off' },
  { label: 'Auto', value: 'auto', disabled: Platform.OS === 'ios' },
];

const SettingsScreen = () => {
  const [settings, setSettings] = useState(defaultSettings);
  const { theme, setTheme } = useTheme();
  const [lightLevel, setLightLevel] = useState<number | null>(null);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Załaduj ustawienia
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = await AsyncStorage.getItem(SETTINGS_KEY);
        if (savedSettings) setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.log('Failed to load settings:', e);
      }
    };
    loadSettings();
  }, []);

  // Reakcja na zmianę trybu motywu
  useEffect(() => {
    let subscription: any;
    if (settings.themeMode === 'auto' && Platform.OS !== 'ios') {
      subscription = LightSensor.addListener(({ illuminance }) => {
        setLightLevel(illuminance);
        if (illuminance < LIGHT_THRESHOLD && theme !== 'dark') setTheme('dark');
        else if (illuminance >= LIGHT_THRESHOLD && theme !== 'light') setTheme('light');
      });
    } else if (settings.themeMode === 'on') setTheme('dark');
    else if (settings.themeMode === 'off') setTheme('light');
    return () => { if (subscription) subscription.remove(); };
  }, [settings.themeMode, setTheme, theme]);

  // Zapisywanie zmian
  const saveSettings = async (newSettings: typeof defaultSettings) => {
    try { await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings)); }
    catch (e) { console.log('Failed to save settings:', e); }
  };

  // Handlery do zmian
  const changeThemeMode = (mode: 'on' | 'off' | 'auto') => {
    const updated = { ...settings, themeMode: mode };
    setSettings(updated);
    saveSettings(updated);
  };
  const changeLanguage = (lang: string) => {
    const updated = { ...settings, language: lang };
    setSettings(updated);
    saveSettings(updated);
  };
  const toggleNotifications = () => {
    const updated = { ...settings, notificationsEnabled: !settings.notificationsEnabled };
    setSettings(updated);
    saveSettings(updated);
  };

  // Kolory
  const backgroundColor = theme === 'dark' ? '#424242' : '#f2f2f2';
  const textColor = theme === 'dark' ? '#fff' : '#222831';
  const cardColor = theme === 'dark' ? '#303030' : '#fff';

  // Uniwersalny selektor segmentowy
  const renderSegment = (options: any[], selected: string, onSelect: (v: any) => void) => (
    <View style={styles.segmentContainer}>
      {options.map(opt => (
        <TouchableOpacity
          key={opt.value}
          style={[
            styles.segment,
            { 
              backgroundColor: selected === opt.value ? '#34c759' : cardColor, 
              borderColor: selected === opt.value ? '#34c759' : '#8881',
              opacity: opt.disabled ? 0.4 : 1
            }
          ]}
          activeOpacity={opt.disabled ? 1 : 0.7}
          onPress={() => !opt.disabled && onSelect(opt.value)}
        >
          <Text style={{
            color: selected === opt.value ? '#fff' : textColor,
            fontWeight: selected === opt.value ? 'bold' : 'normal',
            fontSize: 15,
          }}>
            {opt.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <Text style={[styles.header, { color: textColor }]}>Ustawienia</Text>

      {/* Motyw */}
      <View style={[styles.block, { backgroundColor: cardColor }]}>
        <Text style={[styles.label, { color: textColor, marginBottom: 6 }]}>Motyw aplikacji</Text>
        {renderSegment(THEMES, settings.themeMode, changeThemeMode)}
        {settings.themeMode === 'auto' && Platform.OS !== 'ios' && (
          <Text style={styles.hint}>Jasność: {lightLevel !== null ? lightLevel.toFixed(1) : '–'} lx (próg: {LIGHT_THRESHOLD})</Text>
        )}
        {settings.themeMode === 'auto' && Platform.OS === 'ios' && (
          <Text style={styles.hint}>Automatyczny motyw nie działa na iOS (brak czujnika światła)</Text>
        )}
      </View>

      {/* Powiadomienia */}
      <View style={[styles.block, { backgroundColor: cardColor, flexDirection: 'row', alignItems: 'center' }]}>
        <Text style={[styles.label, { color: textColor, marginRight: 16 }]}>Powiadomienia</Text>
        <Switch
          value={settings.notificationsEnabled}
          onValueChange={toggleNotifications}
          trackColor={{ false: "#767577", true: "#34c759" }}
          thumbColor={settings.notificationsEnabled ? "#34c759" : "#f4f3f4"}
        />
      </View>

      {/* Język */}
      <View style={[styles.block, { backgroundColor: cardColor }]}>
        <Text style={[styles.label, { color: textColor, marginBottom: 6 }]}>Język</Text>
        {renderSegment(LANGUAGES, settings.language, changeLanguage)}
      </View>

      <TouchableOpacity
        style={[
          styles.supportBtn,
          { backgroundColor: theme === 'dark' ? '#1976d2' : '#4A90E2' }
        ]}
        onPress={() => navigation.navigate('HelpSupport')}
        activeOpacity={0.8}
      >
        <Text style={styles.supportBtnText}>Wsparcie / Pomoc</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 30,
  },
  header: {
    fontSize: 26,
    marginBottom: 25,
    fontWeight: 'bold',
    alignSelf: 'center',
    letterSpacing: 1,
  },
  block: {
    marginBottom: 22,
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.09,
    shadowRadius: 7,
    elevation: 2,
  },
  label: {
    fontSize: 17,
    marginBottom: 8,
    fontWeight: '600',
  },
  segmentContainer: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 6,
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderRightWidth: 0,
    borderColor: '#e0e0e0',
  },
  hint: {
    fontSize: 12,
    color: '#777',
    marginTop: 7,
    marginLeft: 2,
  },
  supportBtn: {
    marginTop: 10,
    marginBottom: 30,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 1,
  },
  supportBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
    letterSpacing: 0.5,
  },
});

export default SettingsScreen;
