import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './src/screens/Dashboard/HomeScreen';
import LoginScreen from './src/screens/Auth/LoginScreen';
import RegisterScreen from './src/screens/Auth/RegisterScreen';
import ResetPasswordScreen from './src/screens/Auth/ResetPasswordScreen';
import UserProfileScreen from './src/screens/Profile/UserProfileScreen';
import SettingsScreen from './src/screens/Settings/SettingsScreen';
import ListScreen from './src/screens/List/ListScreen';
import DetailScreen from './src/screens/Details/DetailScreen';
import SearchScreen from './src/screens/Search/SearchScreen';
import NotificationsScreen from './src/screens/Notifications/NotificationsScreen';
import FormScreen from './src/screens/Form/FormScreen';
import PaymentScreen from './src/screens/Payment/PaymentScreen';
import ErrorScreen from './src/screens/Feedback/ErrorScreen';
import SuccessScreen from './src/screens/Feedback/SuccessScreen';
import OrderHistoryScreen from './src/screens/History/OrderHistoryScreen';
import HelpSupportScreen from './src/screens/Support/HelpSupportScreen';

import { RootStackParamList } from './src/navigation/types';




const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        <Stack.Screen name="UserProfile" component={UserProfileScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="List" component={ListScreen} />
        <Stack.Screen name="Detail" component={DetailScreen} />
        <Stack.Screen name="Search" component={SearchScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="Form" component={FormScreen} />
        <Stack.Screen name="Payment" component={PaymentScreen} />
        <Stack.Screen name="Error" component={ErrorScreen} />
        <Stack.Screen name="Success" component={SuccessScreen} />
        <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
        <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
