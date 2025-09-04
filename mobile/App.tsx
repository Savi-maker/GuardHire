
import React, { useEffect, useState, createContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { TouchableOpacity, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './src/screens/Auth/LoginScreen';
import RegisterScreen from './src/screens/Auth/RegisterScreen';
import ResetPasswordScreen from './src/screens/Auth/ResetPasswordScreen';
import UserProfileScreen from './src/screens/Profile/UserProfileScreen';
import EditProfileScreen from './src/screens/Profile/EditProfileScreen';
import SettingsScreen from './src/screens/Settings/SettingsScreen';
import ListScreen from './src/screens/List/ListScreen';
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
import BottomTabNavigator from './src/navigation/BottomTabNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AdminPanelScreen from './src/screens/Admin/AdminPanelScreen';
import CurrentLocationScreen from './src/screens/Location/CurrentLocationScreen';
import AssignedOrdersScreen from './src/screens/AssignedOrders/AssignedOrdersScreen';
import RaportScreen from './src/screens/Raport/RaportScreen';
import AddRaportScreen from './src/screens/Raport/AddRaportScreen';
import UserRaportScreen from './src/screens/Raport/UserRaportsScreen';

export const AuthContext = createContext({
  isLoggedIn: false,
  setIsLoggedIn: (_: boolean) => {},
});

const AuthStack = createNativeStackNavigator();
import type { RootStackParamList } from './src/navigation/types';
const AppStack = createNativeStackNavigator<RootStackParamList>();

function AuthStackScreen() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </AuthStack.Navigator>
  );
}

function MainAppStackScreen() {
  return (
    <AppStack.Navigator initialRouteName="Main" screenOptions={{ headerShown: false }}>
      <AppStack.Screen name="Main" component={BottomTabNavigator} />
      <AppStack.Screen name="UserProfile" component={UserProfileScreen} />
      <AppStack.Screen name="EditProfile" component={EditProfileScreen} />
      <AppStack.Screen name="Settings" component={SettingsScreen} />
      <AppStack.Screen name="List" component={ListScreen} />
      <AppStack.Screen name="Search" component={SearchScreen} />
      <AppStack.Screen name="Notifications" component={NotificationsScreen} />
      <AppStack.Screen name="Form" component={FormScreen} />
      <AppStack.Screen name="Payment" component={PaymentScreen} options={{headerShown: true}} />
      <AppStack.Screen name="TransactionDetails" component={TransactionDetailsScreen} options={{headerShown: true}} />
      <AppStack.Screen name="Success" component={SuccessScreen} />
      <AppStack.Screen name="AssignedOrders" component={AssignedOrdersScreen} />
      <AppStack.Screen name="OrderHistory" component={OrderHistoryScreen} />
      <AppStack.Screen name="HelpSupport" component={HelpSupportScreen} />
  <AppStack.Screen name="ItemDetails" component={ItemDetailsScreen} />
      <AppStack.Screen name="AdminPanel" component={AdminPanelScreen} />
      <AppStack.Screen name="UserRaports" component={UserRaportScreen} options={{ headerShown: true, title: 'Twoje Raporty' }} />
      <AppStack.Screen name="Raport" component={RaportScreen} options={{ headerShown: true, title: 'Raporty' }} />
      <AppStack.Screen name="CurrentLocation" component={CurrentLocationScreen} options={{ headerShown: true, title: 'Twoja lokalizacja' }} />
      <AppStack.Screen name="AddRaport" component={AddRaportScreen} options={{ headerShown: true, title: 'Dodaj raport' }} />
    </AppStack.Navigator>
  );
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('token');
      setIsLoggedIn(!!token);
    };
    checkToken();
  }, []);

  if (isLoggedIn === null) return null; // Możesz dodać loader

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ErrorProvider>
          <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
            <NavigationContainer>
              {isLoggedIn ? <MainAppStackScreen /> : <AuthStackScreen />}
            </NavigationContainer>
          </AuthContext.Provider>
        </ErrorProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}