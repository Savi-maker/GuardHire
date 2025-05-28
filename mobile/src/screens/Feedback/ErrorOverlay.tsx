import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useError } from './ErrorContext';

const ErrorOverlay: React.FC = () => {
  const { error, setError } = useError();

  if (!error) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.box}>
        <Text style={styles.title}>⚠️ Wystąpił problem</Text>
        <Text style={styles.message}>{error}</Text>
        <TouchableOpacity onPress={() => setError(null)} style={styles.button}>
          <Text style={styles.buttonText}>Zamknij</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ErrorOverlay;

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#00000099',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  box: {
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 10,
    alignItems: 'center',
    maxWidth: '80%',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#000',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
