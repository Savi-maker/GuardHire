import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const PaymentScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text>PaymentScreen</Text>
    </View>
  );
};

export default PaymentScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
