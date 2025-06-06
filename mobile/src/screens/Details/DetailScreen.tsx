import React, {useEffect, useState} from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTheme } from '../ThemeContext/ThemeContext';
import { getMyProfile } from '../../utils/api';

type NewsType = { id: number; title: string; description: string };

type DetailScreenProps = {
  visible: boolean;
  onClose: () => void ;
   news?: NewsType | null;
  onDelete: (id:number) => void;
  onEdit: (id:number) => void;
}
const DetailScreen: React.FC<DetailScreenProps> = ({ visible, onClose, news, onDelete, onEdit }) => {
  const { theme } = useTheme();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
  getMyProfile()
    .then(user => {
      console.log("Użytkownik (getMyProfile):", user);
      setRole(user?.role ?? null);
    })
    .catch(e => {
      setRole(null);
    });
}, [visible]);

  const backgroundColor = theme === 'dark' ? '#303030cc' : '#ffffffcc';
  const textColor = theme === 'dark' ? '#fff' : '#000';

  if (!news) {
    // Gdy news nie został przekazany — nie pokazuj modału
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor }]}>
          <Text style={[styles.title, { color: textColor }]}>{news.title}</Text>
          <Text style={[styles.desc, { color: textColor }]}>{news.description}</Text>

          {/* Przyciski tylko dla admina */}
          {role === 'admin'  && (
            <View style={styles.buttonsRow}>
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: '#ff4444' }]}
                onPress={() => {
                  Alert.alert('Potwierdź', 'Czy na pewno chcesz usunąć?', [
                    { text: 'Anuluj', style: 'cancel' },
                    { text: 'Usuń', style: 'destructive', onPress: () => onDelete(news.id) }
                  ]);
                }}
              >
                <Text style={styles.btnText}>Usuń</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: '#0059b2' }]}
                onPress={() => onEdit(news.id)}
              >
                <Text style={styles.btnText}>Edytuj</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={{ color: '#888', fontSize: 18 }}>Zamknij</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center',
  },
  modal: {
    width: '88%',
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
  },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  desc: { fontSize: 16, marginBottom: 30, textAlign: 'center' },
  buttonsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  btn: { flex: 1, marginHorizontal: 6, borderRadius: 8, padding: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700' },
  closeBtn: { marginTop: 10, padding: 10 },
});

export default DetailScreen;