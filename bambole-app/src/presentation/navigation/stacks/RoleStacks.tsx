import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ParentHome, MonitorHome, AdminHome } from '../../screens/HomeScreens';
import { AttendanceScreen } from '../../screens/monitor/AttendanceScreen';
import { ParentHomeScreen } from '../../screens/parent/ParentHomeScreen';
import { AdminHomeScreen } from '../../screens/admin/AdminHomeScreen';
import { CreateAnnouncementScreen } from '../../screens/admin/CreateAnnouncementScreen';

const Stack = createStackNavigator();

export const ParentStack = () => (
    <Stack.Navigator>
        <Stack.Screen name="ParentHome" component={ParentHomeScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
);

export const MonitorStack = () => (
    <Stack.Navigator>
        <Stack.Screen name="MonitorHome" component={MonitorHome} options={{ title: 'Bambolê - Monitor' }} />
        <Stack.Screen name="Attendance" component={AttendanceScreen} options={{ title: 'Realizar Chamada' }} />
    </Stack.Navigator>
);

export const AdminStack = () => (
    <Stack.Navigator>
        <Stack.Screen name="AdminHome" component={AdminHomeScreen} options={{ title: 'Bambolê - Admin' }} />
        <Stack.Screen name="CreateAnnouncement" component={CreateAnnouncementScreen} options={{ title: 'Novo Aviso' }} />
    </Stack.Navigator>
);
