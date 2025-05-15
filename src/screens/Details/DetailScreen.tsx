import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const DetailScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text>DetailScreen</Text>
    </View>
  );
};

export default DetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
