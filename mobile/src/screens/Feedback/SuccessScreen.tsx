import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SuccessScreenRouteParams {
  title?: string;
  description?: string;
  nextScreen?: string;
}

interface SuccessScreenProps {
  route: { params?: SuccessScreenRouteParams };
  navigation: any;
}

const SuccessScreen: React.FC<SuccessScreenProps> = ({ route, navigation }) => {
  const scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 6,
      useNativeDriver: true,
    }).start();
  }, [scale]);

  const { title = 'Operacja zakończona pomyślnie', description, nextScreen } = route.params || {};

  const handlePress = () => {
    if (nextScreen) {
      navigation.replace(nextScreen);
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <Ionicons name="checkmark-circle" size={120} color="#4BB543" />
      </Animated.View>

      <Text style={styles.title}>{title}</Text>
      {!!description && <Text style={styles.description}>{description}</Text>}

      <TouchableOpacity style={styles.button} onPress={handlePress}>
        <Text style={styles.buttonText}>OK</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SuccessScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginTop: 24,
    textAlign: 'center',
    color: '#1B1B1B',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#4A4A4A',
    marginTop: 12,
  },
  button: {
    marginTop: 32,
    paddingVertical: 12,
    paddingHorizontal: 32,
    backgroundColor: '#4BB543',
    borderRadius: 24,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
