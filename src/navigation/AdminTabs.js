import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminJobsScreen from '../screens/admin/AdminJobsScreen';
import AdminProfileScreen from '../screens/admin/AdminProfileScreen';

const Tab = createBottomTabNavigator();

export default function AdminTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#10b981',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: { backgroundColor: '#fff', borderTopWidth: 0, elevation: 5 },
        tabBarIcon: ({ color, size }) => {
          let icon;
          if (route.name === 'Dashboard') icon = 'speedometer';
          else if (route.name === 'Jobs') icon = 'construct';
          else if (route.name === 'Profile') icon = 'person-circle';
          return <Ionicons name={icon} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={AdminDashboardScreen} options={{ title: 'แดชบอร์ด' }} />
      <Tab.Screen name="Jobs" component={AdminJobsScreen} options={{ title: 'งานซ่อม' }} />
      <Tab.Screen name="Profile" component={AdminProfileScreen} options={{ title: 'โปรไฟล์' }} />
    </Tab.Navigator>
  );
}
