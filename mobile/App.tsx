import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './src/screens/Auth/LoginScreen';
import RegisterScreen from './src/screens/Auth/RegisterScreen';
import ResetPasswordScreen from './src/screens/Auth/ResetPasswordScreen';
import UserProfileScreen from './src/screens/Profile/UserProfileScreen';
import EditProfileScreen from './src/screens/Profile/EditProfileScreen';
import SettingsScreen from './src/screens/Settings/SettingsScreen';
import ListScreen from './src/screens/List/ListScreen';
import AddOrderScreen from './src/screens/List/AddOrderScreen';
import DetailScreen from './src/screens/Details/DetailScreen';
import SearchScreen from './src/screens/Search/SearchScreen';
import NotificationsScreen from './src/screens/Notifications/NotificationsScreen';
import FormScreen from './src/screens/Form/FormScreen';
import PaymentScreen from './src/screens/Payment/PaymentScreen';
import TransactionDetailsScreen from './src/screens/Payment/TransactionDetails';
import { ErrorProvider } from './src/screens/Feedback/ErrorContext';
import ErrorOverlay from './src/screens/Feedback/ErrorOverlay';
import ItemDetailsScreen from './src/screens/Details/ItemDetailsScreen';
import SuccessScreen from './src/screens/Feedback/SuccessScreen';
import OrderHistoryScreen from './src/screens/History/OrderHistoryScreen';
import HelpSupportScreen from './src/screens/Support/HelpSupportScreen';
import { ThemeProvider } from './src/screens/ThemeContext/ThemeContext';
import { RootStackParamList } from './src/navigation/types';
import BottomTabNavigator from './src/navigation/BottomTabNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AdminPanelScreen from './src/screens/Admin/AdminPanelScreen';


const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
  <ThemeProvider>
    <ErrorProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Main" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Main" component={BottomTabNavigator} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
          <Stack.Screen name="UserProfile" component={UserProfileScreen} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="List" component={ListScreen} />
          <Stack.Screen name="AddOrder" component={AddOrderScreen} options={{ title: 'Nowe zlecenie' }} />
          <Stack.Screen name="Search" component={SearchScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
          <Stack.Screen name="Form" component={FormScreen} />
          <Stack.Screen name="Payment" component={PaymentScreen} options={{headerShown: true}} />
          <Stack.Screen name="TransactionDetails" component={TransactionDetailsScreen} options={{headerShown: true}} />
          <Stack.Screen name="Success" component={SuccessScreen} />
          <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
          <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
          <Stack.Screen name="ItemDetails" component={ItemDetailsScreen} />
          <Stack.Screen name="AdminPanel" component={AdminPanelScreen} />
        </Stack.Navigator>
      </NavigationContainer>
      <ErrorOverlay /> 
    </ErrorProvider>
  </ThemeProvider>
</SafeAreaProvider>
  );
}
