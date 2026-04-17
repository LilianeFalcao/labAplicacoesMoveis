import { MONITOR_DASHBOARD_DATA } from "../../../presentation/screens/monitor/MonitorMockData";

export interface MonitorClass {
    id: string;
    name: string;
    timeLabel: string;
}

export class GetMonitorClassesUseCase {
    async execute(): Promise<MonitorClass[]> {
        // In a functional mock, this would filter by the current monitor's ID.
        // For now, we return all classes from the dashboard agenda.
        return MONITOR_DASHBOARD_DATA.agenda.map(item => ({
            id: item.id,
            name: item.name,
            timeLabel: item.timeLabel
        }));
    }
}
