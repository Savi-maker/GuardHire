import React, { useState, useEffect } from 'react';
import {View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, ImageBackground, Modal, ActivityIndicator,} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { useNavigation, NavigationProp} from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import BackgroundImage from '../../../assets/images/loginScreenLogo.png';

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
  type: 'error' | 'success';
}

type RootStackParamList = {
  Login: undefined;
  ResetPassword: undefined;
  Register: undefined;
  Main: undefined;
};

const CustomAlert: React.FC<CustomAlertProps> = ({ visible, title, message, onClose, type }) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  return (
      <Modal
          transparent
          visible={visible}
          animationType="fade"
          onRequestClose={onClose}
      >
        <View style={modalStyles.overlay}>
          <View style={modalStyles.modalContainer}>
            <View style={[
              modalStyles.header,
              type === 'error' ? modalStyles.errorHeader : modalStyles.successHeader
            ]}>
              <Text style={modalStyles.title}>{title}</Text>
            </View>
            <View style={modalStyles.body}>
              <Text style={modalStyles.message}>{message}</Text>
            </View>
            <TouchableOpacity
                style={[
                  modalStyles.button,
                  type === 'error' ? modalStyles.errorButton : modalStyles.successButton
                ]}
                onPress={() => {
                  onClose();
                  if (type === 'success') {
                    navigation.navigate('Login');
                  }
                }}
            >
              <Text style={modalStyles.buttonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
  );
};

const ResetPasswordScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [email, setEmail] = useState('');
  const [language, setLanguage] = useState<string>('pl');
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState(false);

  const [modalConfig, setModalConfig] = useState<{
    title: string;
    message: string;
    type: 'error' | 'success';
  }>({
    title: '',
    message: '',
    type: 'error'
  });

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const storedLang = await AsyncStorage.getItem('language');
        if (storedLang) setLanguage(storedLang);
      } catch (error) {
        console.error('Błąd podczas wczytywania języka:', error);
      }
    };
    loadLanguage();
  }, []);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const changeLanguage = async (lang: string) => {
    try {
      setLanguage(lang);
      await AsyncStorage.setItem('language', lang);
    } catch (error) {
      console.error('Błąd podczas zmiany języka:', error);
    }
  };

  const showModal = (title: string, message: string, type: 'error' | 'success') => {
    setModalConfig({ title, message, type });
    setModalVisible(true);
  };

  const handleResetPassword = async () => {
    setEmailError(false);

    if (!email) {
      setEmailError(true);
      showModal('Błąd', 'Proszę podać adres email', 'error');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError(true);
      showModal('Błąd', 'Nieprawidłowy format adresu email', 'error');
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implementacja logiki resetowania hasła
      await new Promise(resolve => setTimeout(resolve, 1000)); // Symulacja opóźnienia
      showModal('Sukces', 'Link do resetowania hasła został wysłany na podany adres email', 'success');
    } catch (error) {
      showModal('Błąd', 'Wystąpił błąd podczas wysyłania linku resetującego hasło', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <ImageBackground source={BackgroundImage} style={styles.background} resizeMode="cover">
        <SafeAreaView style={styles.container}>
          <TouchableOpacity
              style={styles.closeButton}
              onPress={() => navigation.goBack()}
              accessibilityLabel="Zamknij ekran resetowania hasła"
          >
            <Ionicons name="close" size={30} color="#000" />
          </TouchableOpacity>

          <View style={styles.contentWrapper}>
            <View style={styles.content}>
              <Text style={styles.title}>Reset hasła</Text>

              <TextInput
                  style={[
                    styles.input,
                    emailError && styles.inputError
                  ]}
                  placeholder="Email"
                  placeholderTextColor="#aaa"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setEmailError(false);
                  }}
                  accessibilityLabel="Pole email"
                  accessibilityHint="Wprowadź swój adres email"
              />

              <TouchableOpacity
                  style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                  onPress={handleResetPassword}
                  disabled={isLoading}
                  accessibilityLabel="Przycisk resetuj hasło"
              >
                {isLoading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.loginButtonText}>Wyślij link resetujący</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                  onPress={() => navigation.navigate('Login')}
                  accessibilityLabel="Powrót do logowania"
              >
                <Text style={styles.forgotPassword}>Powrót do logowania</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.languagePickerContainer}>
            <Text style={styles.label}>Język</Text>
            <Picker
                selectedValue={language}
                style={styles.picker}
                onValueChange={changeLanguage}
                mode="dropdown"
                accessibilityLabel="Wybór języka"
            >
              <Picker.Item label="Polski" value="pl" />
              <Picker.Item label="English" value="en" />
            </Picker>
          </View>

          <CustomAlert
              visible={modalVisible}
              title={modalConfig.title}
              message={modalConfig.message}
              type={modalConfig.type}
              onClose={() => {
                setModalVisible(false);
                if (modalConfig.type === 'success') {
                  navigation.navigate('Login');
                }
              }}
          />
        </SafeAreaView>
      </ImageBackground>
  );
};

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

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    paddingHorizontal: 32,
    backgroundColor: 'transparent',
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: '20%',
  },
  content: {},
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 32,
    alignSelf: 'center',
    color: '#333',
  },
  input: {
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  inputError: {
    borderColor: '#ff6b6b',
    backgroundColor: '#fff0f0',
  },
  loginButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  forgotPassword: {
    color: '#4A90E2',
    marginTop: 16,
    alignSelf: 'center',
    fontSize: 14,
  },
  languagePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginRight: 16,
  },
  picker: {
    flex: 1,
    height: 50,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
});

export default ResetPasswordScreen;