import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const UserProfileScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text>UserProfileScreen</Text>
    </View>
  );
};

export default UserProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
