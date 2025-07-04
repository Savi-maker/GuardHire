import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';

interface NewsType {
  id: number;
  title: string;
  description: string;
}

interface DetailScreenProps {
  visible: boolean;
  onClose: () => void;
  news: NewsType;
  onDelete: (id: number) => void;
  onEdit: (id: number, title: string, description: string) => void;
  role?: string; 
}

const DetailScreen: React.FC<DetailScreenProps> = ({
  visible,
  onClose,
  news,
  onDelete,
  onEdit,
  role, 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(news.title);
  const [editedDescription, setEditedDescription] = useState(news.description);

  
  useEffect(() => {
    setEditedTitle(news.title);
    setEditedDescription(news.description);
    setIsEditing(false);
  }, [news, visible]);


  const textColor = '#222';

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {isEditing ? (
            <>
              <Text style={[styles.label, { color: textColor }]}>Tytuł:</Text>
              <TextInput
                value={editedTitle}
                onChangeText={setEditedTitle}
                style={[styles.input, { color: textColor, borderColor: textColor }]}
              />
              <Text style={[styles.label, { color: textColor }]}>Opis:</Text>
              <TextInput
                value={editedDescription}
                onChangeText={setEditedDescription}
                style={[styles.input, { color: textColor, borderColor: textColor, minHeight: 60 }]}
                multiline
              />
              <View style={styles.buttonsRow}>
                <TouchableOpacity
                  style={[styles.btn, { backgroundColor: '#51cf66' }]}
                  onPress={() => {
                    onEdit(news.id, editedTitle, editedDescription);
                    setIsEditing(false);
                  }}
                >
                  <Text style={styles.btnText}>Zapisz</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.btn, { backgroundColor: '#aaa' }]}
                  onPress={() => setIsEditing(false)}
                >
                  <Text style={styles.btnText}>Anuluj</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <Text style={[styles.title, { color: textColor }]}>{news.title}</Text>
              <Text style={[styles.desc, { color: textColor }]}>{news.description}</Text>
              {role === 'admin' && (
                <View style={styles.buttonsRow}>
                  <TouchableOpacity
                    style={[styles.btn, { backgroundColor: '#ff6b6b' }]}
                    onPress={() =>
                      Alert.alert('Potwierdź', 'Czy na pewno chcesz usunąć tę aktualność?', [
                        { text: 'Anuluj', style: 'cancel' },
                        { text: 'Usuń', style: 'destructive', onPress: () => onDelete(news.id) },
                      ])
                    }
                  >
                    <Text style={styles.btnText}>Usuń</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.btn, { backgroundColor: '#0059b2' }]}
                    onPress={() => setIsEditing(true)}
                  >
                    <Text style={styles.btnText}>Edytuj</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}

          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={[styles.btnText, { color: '#0059b2' }]}>Zamknij</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default DetailScreen;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#000a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    minHeight: 220,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 1, height: 2 },
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  desc: {
    fontSize: 15,
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontWeight: '600',
    marginBottom: 4,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    fontSize: 15,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginHorizontal: 6,
  },
  btnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
    textAlign: 'center',
  },
  closeBtn: {
    alignSelf: 'center',
    marginTop: 8,
    padding: 10,
  },
});
