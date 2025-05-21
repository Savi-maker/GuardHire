import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ImageBackground,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import BackgroundImage from '../../../assets/images/loginScreenLogo.png';

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
  type: 'error' | 'success';
}

const CustomAlert: React.FC<CustomAlertProps> = ({ visible, title, message, onClose, type }) => (
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
              onPress={onClose}
          >
            <Text style={modalStyles.buttonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
);

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [language, setLanguage] = useState<string>('pl');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: '',
    message: '',
    type: 'error' as 'error' | 'success'
  });

  useEffect(() => {
    const loadLanguage = async () => {
      const storedLang = await AsyncStorage.getItem('language');
      if (storedLang) setLanguage(storedLang);
    };
    loadLanguage();
  }, []);

  const changeLanguage = async (lang: string) => {
    setLanguage(lang);
    await AsyncStorage.setItem('language', lang);
  };

  const showModal = (title: string, message: string, type: 'error' | 'success') => {
    setModalConfig({ title, message, type });
    setModalVisible(true);
  };

  const handleLogin = () => {
    if (!email && !password) {
      showModal('Błąd', 'Proszę podać email i hasło', 'error');
      return;
    }

    if (!email) {
      showModal('Błąd', 'Proszę podać email', 'error');
      return;
    }

    if (!password) {
      showModal('Błąd', 'Proszę podać hasło', 'error');
      return;
    }

    showModal('Sukces', 'Logowanie zakończone powodzeniem!', 'success');
  };

  return (
      <ImageBackground source={BackgroundImage} style={styles.background} resizeMode="cover">
        <SafeAreaView style={styles.container}>
          <View style={styles.contentWrapper}>
            <View style={styles.content}>
              <Text style={styles.title}>Zaloguj się</Text>

              <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#aaa"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
              />

              <TextInput
                  style={styles.input}
                  placeholder="Hasło"
                  placeholderTextColor="#aaa"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
              />

              <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                <Text style={styles.loginButtonText}>Zaloguj</Text>
              </TouchableOpacity>

              <TouchableOpacity>
                <Text style={styles.forgotPassword}>Zapomniałeś hasła?</Text>
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
              onClose={() => setModalVisible(false)}
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
    paddingTop: 100,
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
  loginButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
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
});

export default LoginScreen;