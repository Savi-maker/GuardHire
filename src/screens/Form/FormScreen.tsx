import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const FormScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text>FormScreen</Text>
    </View>
  );
};

export default FormScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
