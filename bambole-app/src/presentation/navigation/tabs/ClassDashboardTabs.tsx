import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Theme } from '../../styles/Theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, RouteProp } from '@react-navigation/native';
import { MonitorStackParamList, ClassDashboardTabsParamList } from '../types';

import { AttendanceScreen } from '../../screens/monitor/AttendanceScreen';
import { PhotoCaptureScreen } from '../../screens/monitor/PhotoCaptureScreen';
import { MonitorObservationsScreen } from '../../screens/monitor/MonitorObservationsScreen';
import { GroupAgendaScreen } from '../../screens/monitor/GroupAgendaScreen';

const Tab = createBottomTabNavigator<ClassDashboardTabsParamList>();

const TabIcon = ({ name, color, size }: { name: any; color: string; size: number }) => (
    <MaterialCommunityIcons name={name} color={color} size={size} />
);

const TAB_BAR_BASE_HEIGHT = 70;
const TAB_BAR_BASE_PADDING = 10;

type ClassDashboardRouteProp = RouteProp<MonitorStackParamList, 'ClassDashboard'>;

export const ClassDashboardTabs = () => {
    const insets = useSafeAreaInsets();
    const route = useRoute<ClassDashboardRouteProp>();
    
    // Extract context from the root stack parameter
    const { classId, groupName } = route.params;

    return (
        <Tab.Navigator
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
            <Tab.Screen
                name="Attendance"
                component={AttendanceScreen}
                initialParams={{ classId, groupName }}
                options={{
                    title: 'Chamada',
                    tabBarIcon: (props) => <TabIcon name="clipboard-check-outline" {...props} />,
                }}
            />
            <Tab.Screen
                name="Photos"
                component={PhotoCaptureScreen}
                initialParams={{ classId, groupName }}
                options={{
                    title: 'Fotos',
                    tabBarIcon: (props) => <TabIcon name="camera-outline" {...props} />,
                }}
            />
            <Tab.Screen
                name="Notices"
                component={MonitorObservationsScreen}
                initialParams={{ classId, groupName }}
                options={{
                    title: 'Avisos',
                    tabBarIcon: (props) => <TabIcon name="note-text-outline" {...props} />,
                }}
            />
            <Tab.Screen
                name="Agenda"
                component={GroupAgendaScreen}
                initialParams={{ classId, groupName }}
                options={{
                    title: 'Agenda',
                    tabBarIcon: (props) => <TabIcon name="calendar-multiselect" {...props} />,
                }}
            />
        </Tab.Navigator>
    );
};
