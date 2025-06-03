import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { auth } from './services/firebaseConfig';

import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import DashboardScreen from './screens/DashboardScreen';
import ChatScreen from './screens/ChatScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Chat') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        options={{
          title: 'Dashboard',
        }}
      />
      <Tab.Screen 
        name="Chat" 
        component={ChatScreen} 
        options={{
          title: 'Chat',
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const handleLogout = async (navigation) => {
    try {
      await signOut(auth);
      navigation.replace('Login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#4CAF50',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Register" 
          component={RegisterScreen} 
          options={{ title: 'Cadastro' }}
        />
        <Stack.Screen 
          name="MainTabs" 
          component={MainTabs} 
          options={({ navigation }) => ({
            headerShown: true,
            title: 'NutriXP',
            headerLeft: () => null,
            headerRight: () => (
              <TouchableOpacity
                onPress={() => handleLogout(navigation)}
                style={{ marginRight: 15 }}
              >
                <Ionicons name="log-out-outline" size={24} color="white" />
              </TouchableOpacity>
            ),
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
} 