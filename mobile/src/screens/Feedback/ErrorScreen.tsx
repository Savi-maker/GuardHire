import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ErrorScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text>ErrorScreen</Text>
    </View>
  );
};

export default ErrorScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
