import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const HelpSupportScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text>HelpSupportScreen</Text>
    </View>
  );
};

export default HelpSupportScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
