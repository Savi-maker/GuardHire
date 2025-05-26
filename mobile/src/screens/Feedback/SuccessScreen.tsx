import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const SuccessScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text>SuccessScreen</Text>
    </View>
  );
};

export default SuccessScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
