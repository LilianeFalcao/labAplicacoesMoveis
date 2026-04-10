import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Theme } from '../../styles/Theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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

import { PhotoFeedScreen } from '../../screens/parent/PhotoFeedScreen';
import { NoticesScreen } from '../../screens/parent/NoticesScreen';

const TAB_BAR_BASE_HEIGHT = 70;
const TAB_BAR_BASE_PADDING = 10;

export const ParentTabs = () => {
    const insets = useSafeAreaInsets();

    return (
        <ParentTabCreator.Navigator
            screenOptions={{
                tabBarActiveTintColor: Theme.colors.primary,
                tabBarInactiveTintColor: Theme.colors.gray[400],
                headerShown: false,
                tabBarStyle: {
                    height: TAB_BAR_BASE_HEIGHT + Math.max(insets.bottom, 10),
                    paddingBottom: TAB_BAR_BASE_PADDING + Math.max(insets.bottom, 10),
                    paddingTop: 10,
                    backgroundColor: '#FFFFFF',
                    borderTopColor: Theme.colors.gray[100],
                    elevation: 10,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -4 },
                    shadowOpacity: 0.05,
                    shadowRadius: 10,
                }
            }}
        >
            <ParentTabCreator.Screen
                name="Home"
                component={ParentHomeScreen}
                options={{
                    title: 'Home',
                    tabBarIcon: (props) => <TabIcon name="home-variant" {...props} />,
                }}
            />
            <ParentTabCreator.Screen
                name="Photos"
                component={PhotoFeedScreen}
                options={{
                    title: 'Fotos',
                    tabBarIcon: (props) => <TabIcon name="image-multiple" {...props} />,
                }}
            />
            <ParentTabCreator.Screen
                name="Notices"
                component={NoticesScreen}
                options={{
                    title: 'Avisos',
                    tabBarIcon: (props) => <TabIcon name="bullhorn" {...props} />,
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
};

export const MonitorTabs = () => {
    const insets = useSafeAreaInsets();

    return (
        <MonitorTabCreator.Navigator
            screenOptions={{
                tabBarActiveTintColor: Theme.colors.primary,
                tabBarInactiveTintColor: Theme.colors.gray[400],
                headerShown: false,
                tabBarStyle: {
                    height: TAB_BAR_BASE_HEIGHT + Math.max(insets.bottom, 10),
                    paddingBottom: TAB_BAR_BASE_PADDING + Math.max(insets.bottom, 10),
                    paddingTop: 10,
                    backgroundColor: '#FFFFFF',
                    borderTopColor: Theme.colors.gray[100],
                    elevation: 10,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -4 },
                    shadowOpacity: 0.05,
                    shadowRadius: 10,
                }
            }}
        >
            <MonitorTabCreator.Screen
                name="Home"
                component={MonitorHomeScreen}
                options={{
                    title: 'Início',
                    tabBarIcon: (props) => <TabIcon name="home-variant" {...props} />,
                }}
            />
            <MonitorTabCreator.Screen
                name="Attendance"
                component={AttendanceScreen}
                options={{
                    title: 'Chamada',
                    tabBarIcon: (props) => <TabIcon name="clipboard-check-outline" {...props} />,
                }}
            />
        </MonitorTabCreator.Navigator>
    );
};

export const AdminTabs = () => {
    const insets = useSafeAreaInsets();

    return (
        <AdminTabCreator.Navigator
            screenOptions={{
                tabBarActiveTintColor: Theme.colors.primary,
                tabBarInactiveTintColor: Theme.colors.gray[400],
                headerShown: false,
                tabBarStyle: {
                    height: TAB_BAR_BASE_HEIGHT + Math.max(insets.bottom, 10),
                    paddingBottom: TAB_BAR_BASE_PADDING + Math.max(insets.bottom, 10),
                    paddingTop: 10,
                    backgroundColor: '#FFFFFF',
                    borderTopColor: Theme.colors.gray[100],
                    elevation: 10,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -4 },
                    shadowOpacity: 0.05,
                    shadowRadius: 10,
                }
            }}
        >
            <AdminTabCreator.Screen
                name="Home"
                component={AdminHomeScreen}
                options={{
                    title: 'Painel',
                    tabBarIcon: (props) => <TabIcon name="view-dashboard-outline" {...props} />,
                }}
            />
            <AdminTabCreator.Screen
                name="Announcements"
                component={CreateAnnouncementScreen}
                options={{
                    title: 'Avisos',
                    tabBarIcon: (props) => <TabIcon name="bullhorn-outline" {...props} />,
                }}
            />
        </AdminTabCreator.Navigator>
    );
};
