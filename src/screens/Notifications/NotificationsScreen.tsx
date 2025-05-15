import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const NotificationsScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text>NotificationsScreen</Text>
    </View>
  );
};

export default NotificationsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
