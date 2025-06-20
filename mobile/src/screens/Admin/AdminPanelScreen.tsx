import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert} from 'react-native';
import { useTheme } from '../ThemeContext/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getProfiles, changeUserRole } from '../../utils/api';

type User = {
  id: number;
  username: string;
  rola: string;
};

const ROLE_LABELS = [
  { rola: 'admin', label: 'Administrator' },
  { rola: 'headuser', label: 'Kierownik' },
  { rola: 'guard', label: 'Ochroniarz' },
  { rola: 'user', label: 'Użytkownik' },
];

const AdminPanelScreen: React.FC = () => {
  const { theme } = useTheme();
  const backgroundColor = theme === 'dark' ? '#303030' : '#ffffff';
  const textColor = theme === 'dark' ? '#ffffff' : '#000000';
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState<number | null>(null);
  const [editedRoles, setEditedRoles] = useState<{ [userId: number]: string }>({});

  useEffect(() => {
  let isMounted = true;
  setLoading(true);
  getProfiles()
    .then(res => {
      if (res.success && isMounted) {
        const mappedUsers = res.data.map((u: any) => ({
          ...u,
          rola: u.rola || u.role || '', 
        }));
        setUsers(mappedUsers);
      }
    })
    .catch(() => Alert.alert('Błąd', 'Nie udało się pobrać użytkowników'))
    .finally(() => setLoading(false));
  return () => { isMounted = false; };
}, []);

  const handleRoleSelect = (userId: number, newRola: string) => {
    setEditedRoles(prev => ({ ...prev, [userId]: newRola }));
  };

  const saveRoles = async () => {
    setRoleLoading(-1);
    try {
      const promises = Object.entries(editedRoles).map(([userId, newRola]) =>
        changeUserRole(Number(userId), newRola)
      );
      await Promise.all(promises);
        const res = await getProfiles();
        if (res.success) {
        const mappedUsers = res.data.map((u: any) => ({
            ...u,
            rola: u.rola || u.role || '',
        }));
        setUsers(mappedUsers);
        setEditedRoles({});
        Alert.alert('Sukces', 'Zmiany zapisane!');
        }
    } catch (e) {
      Alert.alert('Błąd', 'Nie udało się zapisać zmian');
    }
    setRoleLoading(null);
  };
  

  const renderUser = ({ item }: { item: User }) => {
  const editedRola = editedRoles[item.id];

  return (
    <View style={[styles.userRow, { backgroundColor: theme === 'dark' ? '#292929' : '#fff' }]}>
      <Text style={[styles.username, { color: textColor }]}>{item.username}</Text>
      <View style={styles.roleinfoBlock}>
        <Text style={[styles.currentRole, { color: theme === 'dark' ? '#48e' : '#1464cc' }]}>
          {`Rola: ${ROLE_LABELS.find(r => r.rola === (editedRola || item.rola))?.label || item.rola}`}
        </Text>
        <View style={styles.roles}>
          {ROLE_LABELS.map(role => {
            const isSelected = editedRola
              ? editedRola === role.rola
              : item.rola === role.rola;
            const isEdited = editedRola && editedRola === role.rola && editedRola !== item.rola;

            return (
              <TouchableOpacity
                key={role.rola}
                style={[
                  styles.roleBtn,
                  isEdited && { backgroundColor: '#FFD600', borderColor: '#FFB300' },
                  !isEdited && isSelected && {
                    backgroundColor: theme === 'dark' ? '#348fff' : '#4e93ff',
                    borderColor: '#0055cc'
                  },
                  !isSelected && { backgroundColor: theme === 'dark' ? '#222' : '#ededed', borderColor: 'transparent' },
                  { opacity: roleLoading === item.id ? 0.5 : 1 }
                ]}
                onPress={() => handleRoleSelect(item.id, role.rola)}
                disabled={roleLoading === item.id}
              >
                <Text style={{
                  color: isEdited
                    ? '#333'
                    : (isSelected ? '#fff' : textColor),
                  fontWeight: isSelected ? '700' : '400'
                }}>
                  {role.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
};


  return (
  <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top', 'left', 'right', 'bottom']}>
    <Text style={[styles.header, { color: textColor }]}>Panel administratora</Text>
    {loading ? (
      <ActivityIndicator color="#348fff" size="large" style={{ marginTop: 30 }} />
    ) : (
      <>
        <FlatList
          data={users}
          keyExtractor={item => item.id.toString()}
          renderItem={renderUser}
          contentContainerStyle={{ paddingBottom: 30 }}
        />
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: Object.keys(editedRoles).length ? '#348fff' : '#aaa' }]}
          disabled={roleLoading !== null || !Object.keys(editedRoles).length}
          onPress={saveRoles}
        >
          <Text style={{ color: '#fff', fontSize: 17, fontWeight: 'bold' }}>
            {roleLoading !== null ? 'Zapisywanie...' : 'Zapisz zmiany'}
          </Text>
        </TouchableOpacity>
      </>
    )}
  </SafeAreaView>
);
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 40, paddingHorizontal: 10 },
  header: { fontSize: 26, fontWeight: 'bold', marginBottom: 24, alignSelf: 'center' },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 7,
    borderRadius: 12,
    padding: 14,
    elevation: 2,
    shadowColor: '#0002',
    shadowOpacity: 0.06,
    shadowOffset: { width: 1, height: 2 },
  },
  username: { fontSize: 18, width: 120 },
  picker: {
    height: 36,
    marginLeft: 10,
    borderRadius: 7,
    fontSize: 16,
    minWidth: 110,
  },
  iosRoleBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 9,
    paddingHorizontal: 16,
    alignItems: 'center',
    minWidth: 110,
    marginLeft: 10,
  },
  saveButton: {
    marginTop: 18,
    marginBottom: 26,
    marginHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 16,
    shadowColor: '#0006',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    elevation: 3,
  },
  roleinfoBlock: {
    flex: 1
  },
   roles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    },
  currentRole: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 2,
    marginLeft: 3,
},
  roleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 7,
    borderWidth: 1,
    marginHorizontal: 2,
    minWidth: 58,
    alignItems: 'center',
},


});

export default AdminPanelScreen;
