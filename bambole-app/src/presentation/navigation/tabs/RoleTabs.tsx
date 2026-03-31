import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ParentHomeScreen } from '../../screens/parent/ParentHomeScreen';
import { ParentProfileScreen } from '../../screens/parent/ParentProfileScreen';
import { MonitorHomeScreen } from '../../screens/monitor/MonitorHomeScreen';
import { AttendanceScreen } from '../../screens/monitor/AttendanceScreen';
import { AdminHomeScreen } from '../../screens/admin/AdminHomeScreen';
import { CreateAnnouncementScreen } from '../../screens/admin/CreateAnnouncementScreen';
import { ParentTabsParamList, MonitorTabsParamList, AdminTabsParamList } from '../types';

const ParentTabCreator = createBottomTabNavigator<ParentTabsParamList>();
const MonitorTabCreator = createBottomTabNavigator<MonitorTabsParamList>();
const AdminTabCreator = createBottomTabNavigator<AdminTabsParamList>();

const TabIcon = ({ name, color, size }: { name: any; color: string; size: number }) => (
    <MaterialCommunityIcons name={name} color={color} size={size} />
);

export const ParentTabs = () => (
    <ParentTabCreator.Navigator
        screenOptions={{
            tabBarActiveTintColor: '#6200ee',
            tabBarInactiveTintColor: 'gray',
        }}
    >
        <ParentTabCreator.Screen
            name="Home"
            component={ParentHomeScreen}
            options={{
                title: 'Início',
                tabBarIcon: (props) => <TabIcon name="home" {...props} />,
            }}
        />
        <ParentTabCreator.Screen
            name="Profile"
            component={ParentProfileScreen}
            options={{
                title: 'Perfil',
                tabBarIcon: (props) => <TabIcon name="account" {...props} />,
            }}
        />
    </ParentTabCreator.Navigator>
);

export const MonitorTabs = () => (
    <MonitorTabCreator.Navigator
        screenOptions={{
            tabBarActiveTintColor: '#6200ee',
            tabBarInactiveTintColor: 'gray',
        }}
    >
        <MonitorTabCreator.Screen
            name="Home"
            component={MonitorHomeScreen}
            options={{
                title: 'Início',
                tabBarIcon: (props) => <TabIcon name="home" {...props} />,
            }}
        />
        <MonitorTabCreator.Screen
            name="Attendance"
            component={AttendanceScreen}
            options={{
                title: 'Chamada',
                tabBarIcon: (props) => <TabIcon name="clipboard-check" {...props} />,
            }}
        />
    </MonitorTabCreator.Navigator>
);

export const AdminTabs = () => (
    <AdminTabCreator.Navigator
        screenOptions={{
            tabBarActiveTintColor: '#6200ee',
            tabBarInactiveTintColor: 'gray',
        }}
    >
        <AdminTabCreator.Screen
            name="Home"
            component={AdminHomeScreen}
            options={{
                title: 'Painel',
                tabBarIcon: (props) => <TabIcon name="home" {...props} />,
            }}
        />
        <AdminTabCreator.Screen
            name="Announcements"
            component={CreateAnnouncementScreen}
            options={{
                title: 'Avisos',
                tabBarIcon: (props) => <TabIcon name="bullhorn" {...props} />,
            }}
        />
    </AdminTabCreator.Navigator>
);
