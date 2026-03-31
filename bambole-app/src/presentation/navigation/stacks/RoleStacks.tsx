import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ParentTabs, MonitorTabs, AdminTabs } from '../tabs/RoleTabs';

// Parent Screens
import { ChildDetailsScreen } from '../../screens/parent/ChildDetailsScreen';
import { AttendanceHistoryScreen } from '../../screens/parent/AttendanceHistoryScreen';

// Monitor Screens
import { MonitorHomeScreen } from '@/presentation/screens/monitor/MonitorHomeScreen';
import { GroupAgendaScreen } from '@/presentation/screens/monitor/GroupAgendaScreen';
import { AttendanceScreen } from '@/presentation/screens/monitor/AttendanceScreen';
import { PhotoCaptureScreen } from '@/presentation/screens/monitor/PhotoCaptureScreen';
import { MonitorObservationsScreen } from '@/presentation/screens/monitor/MonitorObservationsScreen';

// Admin Screens
import { AdminHomeScreen } from '../../screens/admin/AdminHomeScreen';
import { MonitorManagementScreen } from '../../screens/admin/MonitorManagementScreen';
import { GroupManagementScreen } from '../../screens/admin/GroupManagementScreen';
import { StudentMonitorLinkingScreen } from '../../screens/admin/StudentMonitorLinkingScreen';
import { CreateAnnouncementScreen } from '../../screens/admin/CreateAnnouncementScreen';

import { ParentStackParamList, MonitorStackParamList, AdminStackParamList } from '../types';

const ParentStackCreator = createStackNavigator<ParentStackParamList>();
const MonitorStackCreator = createStackNavigator<MonitorStackParamList>();
const AdminStackCreator = createStackNavigator<AdminStackParamList>();

export const ParentStack = () => (
    <ParentStackCreator.Navigator screenOptions={{ headerShown: false }}>
        <ParentStackCreator.Screen name="ParentRoot" component={ParentTabs} />
        <ParentStackCreator.Screen name="ChildDetails" component={ChildDetailsScreen} />
        <ParentStackCreator.Screen name="AttendanceHistory" component={AttendanceHistoryScreen} />
    </ParentStackCreator.Navigator>
);

export const MonitorStack = () => (
    <MonitorStackCreator.Navigator screenOptions={{ headerShown: false }}>
        <MonitorStackCreator.Screen name="MonitorRoot" component={MonitorTabs} />
        <MonitorStackCreator.Screen name="GroupAgenda" component={GroupAgendaScreen} />
        <MonitorStackCreator.Screen name="Attendance" component={AttendanceScreen} />
        <MonitorStackCreator.Screen name="PhotoCapture" component={PhotoCaptureScreen} />
        <MonitorStackCreator.Screen name="Observations" component={MonitorObservationsScreen} />
    </MonitorStackCreator.Navigator>
);

export const AdminStack = () => (
    <AdminStackCreator.Navigator screenOptions={{ headerShown: false }}>
        <AdminStackCreator.Screen name="AdminRoot" component={AdminTabs} />
        <AdminStackCreator.Screen name="MonitorManagement" component={MonitorManagementScreen} />
        <AdminStackCreator.Screen name="GroupManagement" component={GroupManagementScreen} />
        <AdminStackCreator.Screen name="StudentMonitorLinking" component={StudentMonitorLinkingScreen} />
        <AdminStackCreator.Screen name="CreateAnnouncement" component={CreateAnnouncementScreen} />
    </AdminStackCreator.Navigator>
);
