import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import UserHomeScreen from '../screens/user/UserHomeScreen';
import UserReportsScreen from '../screens/user/UserReportsScreen';
import UserProfileScreen from '../screens/user/UserProfileScreen';

const Tab = createBottomTabNavigator();

export default function UserTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: { backgroundColor: '#fff', borderTopWidth: 0, elevation: 5 },
        tabBarIcon: ({ color, size }) => {
          let icon;
          if (route.name === 'Home') icon = 'home';
          else if (route.name === 'Reports') icon = 'document-text';
          else if (route.name === 'Profile') icon = 'person';
          return <Ionicons name={icon} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={UserHomeScreen} options={{ title: 'แจ้งซ่อม' }} />
      <Tab.Screen name="Reports" component={UserReportsScreen} options={{ title: 'รายการของฉัน' }} />
      <Tab.Screen name="Profile" component={UserProfileScreen} options={{ title: 'โปรไฟล์' }} />
    </Tab.Navigator>
  );
}
