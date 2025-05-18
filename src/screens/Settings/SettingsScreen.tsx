import React, { useEffect, useState } from 'react';
import { View, Text, Switch, StyleSheet, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '../ThemeContext/ThemeContext';

const SETTINGS_KEY = 'app_settings';

const defaultSettings = {
  darkMode: false,
  notificationsEnabled: true,
  language: 'en',
};

const SettingsScreen = () => {
  const [settings, setSettings] = useState(defaultSettings);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = await AsyncStorage.getItem(SETTINGS_KEY);
        if (savedSettings) {
          setSettings(JSON.parse(savedSettings));
        }
      } catch (e) {
        console.log('Failed to load settings:', e);
      }
    };
    loadSettings();
  }, []);

  const saveSettings = async (newSettings: typeof defaultSettings) => {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
    } catch (e) {
      console.log('Failed to save settings:', e);
    }
  };

  const toggleDarkMode = () => {
    const updated = { ...settings, darkMode: !settings.darkMode };
    setSettings(updated);
    saveSettings(updated);
    toggleTheme(); 
  };

  const toggleNotifications = () => {
    const updated = { ...settings, notificationsEnabled: !settings.notificationsEnabled };
    setSettings(updated);
    saveSettings(updated);
  };

  const changeLanguage = (lang: string) => {
    const updated = { ...settings, language: lang };
    setSettings(updated);
    saveSettings(updated);
  };

  const backgroundColor = theme === 'dark' ? '#303030' : '#ffffff';
  const textColor = theme === 'dark' ? '#ffffff' : '#000000';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
  <Text style={[styles.header, { color: textColor }]}>Ustawienia</Text>

  <View style={styles.row}>
    <Text style={[styles.label, { color: textColor }]}>Tryb ciemny</Text>
    <Switch value={theme === 'dark'} onValueChange={toggleDarkMode} />
  </View>

  <View style={styles.row}>
    <Text style={[styles.label, { color: textColor }]}>Powiadomienia</Text>
    <Switch value={settings.notificationsEnabled} onValueChange={toggleNotifications} />
  </View>

  <View style={styles.row}>
  <Text style={[styles.label, { color: textColor }]}>Język</Text>
  <Picker
    selectedValue={settings.language}
    style={[
      styles.picker,
      {
        color: textColor,
        backgroundColor: theme === 'dark' ? '#424242' : '#e0e0e0',
      },
    ]}
    onValueChange={changeLanguage}
    dropdownIconColor={textColor}
    mode="dropdown"
  >
    <Picker.Item label="Polski" value="pl" color={textColor} />
    <Picker.Item label="English" value="en" color={textColor} />
  </Picker>
</View>



</SafeAreaView>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  header: {
    fontSize: 24,
    marginBottom: 30,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    flex: 1,
  },
  picker: {
    width: 160,
    height: 40,
  },
});




export default SettingsScreen;
