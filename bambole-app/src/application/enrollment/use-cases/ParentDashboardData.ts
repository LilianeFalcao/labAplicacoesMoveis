export interface ParentDashboardData {
    children: Array<{
        id: string;
        name: string;
        classId: string;
        photoUrl?: string;
        status: 'present' | 'absent' | 'pre_justified' | 'justified' | 'pending';
        label: string;
    }>;
    announcements: Array<{
        id: string;
        title: string;
        type: 'alert' | 'info' | 'pending';
        date: string;
        icon: string;
    }>;
}
