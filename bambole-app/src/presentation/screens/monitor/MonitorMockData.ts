import { TurmaAgendaItem } from '../../components/monitor/TurmaAgendaCard';

export interface MonitorDashboardStats {
    activeTurmas: string;
    avgAttendance: string;
}

export interface MonitorDashboardData {
    stats: MonitorDashboardStats;
    agenda: TurmaAgendaItem[];
}

export const MONITOR_DASHBOARD_DATA: MonitorDashboardData = {
    stats: {
        activeTurmas: '04',
        avgAttendance: '88%'
    },
    agenda: [
        {
            id: '1',
            name: 'Futebol',
            category: 'Esportes',
            status: 'pending',
            statusLabel: 'Chamada Pendente',
            ageGroup: '6-9 anos',
            students: 18,
            timeLabel: '14:00 - 15:30',
            location: 'Quadra A'
        },
        {
            id: '2',
            name: 'Artes Plásticas',
            category: 'Criatividade',
            status: 'completed',
            statusLabel: 'Concluída',
            finishedAt: '11:30',
            students: 12,
            timeLabel: '10:00 - 11:30'
        },
        {
            id: '3',
            name: 'Natação',
            category: 'Aquático',
            status: 'upcoming',
            statusLabel: 'Em breve',
            timeLabel: '16:00 - 17:00',
            students: 15,
            avatars: ['1', '2', '3']
        }
    ]
};
