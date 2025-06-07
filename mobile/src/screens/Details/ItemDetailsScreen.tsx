import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TextInput, Button, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useTheme } from '../ThemeContext/ThemeContext';

// Typy

type Order = {
  id: number;
  name: string;
  status: string;
  date: string;
  opis?: string;
  lat?: number;
  lng?: number;
};

type Comment = {
  id: number;
  author: string;
  content: string;
  rating?: number;
};

const ItemDetailsScreen = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [order, setOrder] = useState<Order | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState('');

  const mockOrderId = 1;

  useEffect(() => {
    const mockOrder: Order = {
      id: mockOrderId,
      name: 'Testowe Zlecenie',
      status: 'W trakcie',
      date: '2024-06-07T10:00:00Z',
      opis: 'To jest opis testowego zlecenia. Sprawdzenie lokalizacji i działania komentarzy.',
      lat: 50.866,
      lng: 20.628,
    };

    const mockComments: Comment[] = [
      { id: 1, author: 'Anna', content: 'Wszystko przebiegło pomyślnie.', rating: 5 },
      { id: 2, author: 'Janusz', content: 'Były drobne problemy.', rating: 3 },
    ];

    setTimeout(() => {
      setOrder(mockOrder);
      setComments(mockComments);
    }, 500);
  }, []);

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const newId = comments.length + 1;
    const parsedRating = parseInt(rating);
    const commentToAdd: Comment = {
      id: newId,
      author: 'Jan Kowalski',
      content: newComment.trim(),
      rating: isNaN(parsedRating) ? undefined : parsedRating,
    };

    setComments((prev) => [...prev, commentToAdd]);
    setNewComment('');
    setRating('');
  };

  const background = isDark ? '#121212' : '#fff';
  const text = isDark ? '#fff' : '#000';
  const border = isDark ? '#444' : '#ccc';

  if (!order) return <Text style={[styles.title, { color: text }]}>Ładowanie danych testowych...</Text>;

  return (
    <ScrollView style={[styles.container, { backgroundColor: background }]}>
      <Text style={[styles.title, { color: text }]}>{order.name}</Text>
      <Text style={[styles.label, { color: text }]}>Status:</Text>
      <Text style={{ color: text }}>{order.status}</Text>

      <Text style={[styles.label, { color: text }]}>Data:</Text>
      <Text style={{ color: text }}>{new Date(order.date).toLocaleDateString()}</Text>

      <Text style={[styles.label, { color: text }]}>Opis:</Text>
      <Text style={{ color: text }}>{order.opis ?? 'Brak opisu'}</Text>

      {order.lat && order.lng && (
        <>
          <Text style={[styles.label, { color: text }]}>Lokalizacja:</Text>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: order.lat,
              longitude: order.lng,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Marker
              coordinate={{ latitude: order.lat, longitude: order.lng }}
              title={order.name}
            />
          </MapView>
        </>
      )}

      <Text style={[styles.label, { color: text }]}>Komentarze i oceny:</Text>
      {comments.length === 0 && <Text style={{ color: text }}>Brak komentarzy.</Text>}
      {comments.map((c) => (
        <View key={c.id} style={[styles.commentBox, { borderColor: border }]}>
          <Text style={[styles.commentAuthor, { color: text }]}>{c.author}</Text>
          <Text style={{ color: text }}>{c.content}</Text>
          {c.rating !== undefined && <Text style={{ color: text }}>Ocena: {c.rating}/5</Text>}
        </View>
      ))}

      <TextInput
        placeholder="Dodaj komentarz..."
        value={newComment}
        onChangeText={setNewComment}
        style={[styles.input, { borderColor: border, color: text }]}
        placeholderTextColor={isDark ? '#999' : '#aaa'}
      />
      <TextInput
        placeholder="Ocena (1–5)"
        value={rating}
        onChangeText={setRating}
        keyboardType="numeric"
        style={[styles.input, { borderColor: border, color: text }]}
        placeholderTextColor={isDark ? '#999' : '#aaa'}
      />
      <Button title="Wyślij" onPress={handleAddComment} color={isDark ? '#2196F3' : undefined} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 40, paddingBottom: 16 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  label: { marginTop: 10, fontWeight: 'bold' },
  map: { width: '100%', height: 200, marginVertical: 10 },
  input: {
    borderWidth: 1,
    padding: 8,
    marginVertical: 6,
    borderRadius: 4,
  },
  commentBox: {
    padding: 10,
    borderWidth: 1,
    marginVertical: 4,
    borderRadius: 4,
  },
  commentAuthor: { fontWeight: 'bold' },
});

export default ItemDetailsScreen;
