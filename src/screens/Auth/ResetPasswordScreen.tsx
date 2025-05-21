import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ResetPasswordScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text>ResetPasswordScreen</Text>
    </View>
  );
};

export default ResetPasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
