import { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
    Login: undefined;
    SignUp: undefined;
    Recovery: undefined;
};

export type ParentTabsParamList = {
    Home: undefined;
    Photos: undefined;
    Notices: undefined;
    Profile: undefined;
};

export type ParentStackParamList = {
    ParentRoot: NavigatorScreenParams<ParentTabsParamList>;
    ChildDetails: { childName: string; class_id: string };
    AttendanceHistory: { childName: string };
};

export type MonitorTabsParamList = {
    Home: undefined;
    Profile: undefined;
};

export type ClassDashboardTabsParamList = {
    Agenda: { classId: string; groupName: string };
    Attendance: { classId: string; groupName: string };
    Photos: { classId: string; groupName: string };
    Notices: { classId: string; groupName: string };
};

export type MonitorStackParamList = {
    MonitorRoot: NavigatorScreenParams<MonitorTabsParamList>;
    ClassDashboard: { classId: string; groupName: string };
    Notifications: undefined;
};

export type AdminTabsParamList = {
    Home: undefined;
    Announcements: undefined;
    Profile: undefined;
};

export type AdminStackParamList = {
    AdminRoot: NavigatorScreenParams<AdminTabsParamList>;
    MonitorManagement: undefined;
    GroupManagement: undefined;
    StudentMonitorLinking: undefined;
    CreateAnnouncement: undefined;
};
