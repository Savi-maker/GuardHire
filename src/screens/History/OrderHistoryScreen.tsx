import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const OrderHistoryScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text>OrderHistoryScreen</Text>
    </View>
  );
};

export default OrderHistoryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
