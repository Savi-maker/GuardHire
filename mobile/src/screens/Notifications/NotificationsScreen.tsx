import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { getNotifications,API_URL } from '../../utils/api';
import { useTheme } from '../ThemeContext/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';

type NotificationType = {
  id: number,
  title: string,
  description: string,
  type: string,
  created_at: string,
  read: number
};

const NotificationsScreen: React.FC = () => {
  const { theme } = useTheme();
  const backgroundColor = theme === 'dark' ? '#303030' : '#ffffff';
  const textColor = theme === 'dark' ? '#fff' : '#000';
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);


  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    getNotifications()
      .then(data => { if (isMounted) setNotifications(data); })
      .catch(() => {/* obsługa błędu, np. Toast */})
      .finally(() => setLoading(false));
    return () => { isMounted = false; };
  }, []);

  async function markAsRead(id: number) {
    await fetch(`${API_URL}/notifications/${id}/read`, {
      method: 'PATCH'
    });
    setNotifications(nots => nots.map(n =>
      n.id === id ? { ...n, read: 1 } : n
    ));
  }

  const renderNotification = ({ item }: { item: NotificationType }) => (
    <TouchableOpacity
      onPress={() => {
        setExpandedId(item.id === expandedId ? null : item.id);
        if (!item.read) markAsRead(item.id);
      }}
      style={[
        styles.card,
        {
          backgroundColor: item.read
            ? (theme === 'dark' ? '#424242' : '#f2f2f2')
            : (theme === 'dark' ? '#363652' : '#e3e3ff'), 
          borderLeftWidth: 4,
          borderLeftColor:
            item.type === 'alert' ? 'orange'
            : item.type === 'info' ? 'blue'
            : 'gray',
        }
      ]}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={[styles.notifTitle, { color: textColor }]}>{item.title}</Text>
        {item.read === 0 && (
          <Text style={{ color: 'orange', fontWeight: 'bold', marginLeft: 8 }}>●</Text>
        )}
      </View>
      <Text style={{ color: textColor, fontSize: 12, marginBottom: 5 }}>
        {item.type.toUpperCase()} • {item.created_at ? new Date(item.created_at).toLocaleString() : ''}
      </Text>
      {expandedId === item.id && (
        <Text style={[styles.notifDesc, { color: textColor }]}>{item.description}</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <Text style={[styles.title, { color: textColor }]}>Powiadomienia</Text>
      {loading ? (
        <Text style={{ color: textColor, alignSelf: 'center' }}>Ładowanie...</Text>
      ) : (
       <FlatList
            data={notifications}
            keyExtractor={item => item.id.toString()}
            renderItem={renderNotification}
            ListEmptyComponent={<Text style={{ color: textColor, textAlign: 'center' }}>Brak powiadomień.</Text>}
          />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 18 },
  card: { padding: 16, borderRadius: 10, marginBottom: 14 },
  notifTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 6 },
  notifDesc: { fontSize: 14 },
});

export default NotificationsScreen;
