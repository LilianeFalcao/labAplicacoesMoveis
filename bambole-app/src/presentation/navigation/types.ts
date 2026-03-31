import { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
    Login: undefined;
    SignUp: undefined;
    Recovery: undefined;
};

export type ParentTabsParamList = {
    Home: undefined;
    Profile: undefined;
};

export type ParentStackParamList = {
    ParentRoot: NavigatorScreenParams<ParentTabsParamList>;
    ChildDetails: { childName: string; class_id: string };
    AttendanceHistory: { childName: string };
};

export type MonitorTabsParamList = {
    Home: undefined;
    Attendance: undefined;
};

export type MonitorStackParamList = {
    MonitorRoot: NavigatorScreenParams<MonitorTabsParamList>;
    GroupAgenda: { groupName: string };
    Attendance: { classId: string; groupName: string };
    PhotoCapture: undefined;
    Observations: undefined;
};

export type AdminTabsParamList = {
    Home: undefined;
    Announcements: undefined;
};

export type AdminStackParamList = {
    AdminRoot: NavigatorScreenParams<AdminTabsParamList>;
    MonitorManagement: undefined;
    GroupManagement: undefined;
    StudentMonitorLinking: undefined;
    CreateAnnouncement: undefined;
};
