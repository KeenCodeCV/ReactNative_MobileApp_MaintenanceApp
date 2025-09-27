// App.js
import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, AuthContext } from './src/context/AuthContext';

import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import UserTabs from './src/navigation/UserTabs';
import AdminTabs from './src/navigation/AdminTabs';

const Stack = createNativeStackNavigator();

function Router() {
  const { user } = useContext(AuthContext);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'fade_from_bottom', // ลื่นไหลสวย ๆ ตอนเปลี่ยนหน้า
      }}
    >
      {user ? (
        user.role === 'admin'
          ? <Stack.Screen name="AdminTabs" component={AdminTabs} />
          : <Stack.Screen name="UserTabs" component={UserTabs} />
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Router />
      </NavigationContainer>
    </AuthProvider>
  );
}
