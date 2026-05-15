import { supabase } from '../supabase/client';

export type ConnectivityStatus = 'online' | 'offline';
export type ConnectivityListener = (status: ConnectivityStatus) => void;

export class ConnectivityService {
    private static instance: ConnectivityService;
    private status: ConnectivityStatus = 'online';
    private listeners: ConnectivityListener[] = [];
    private checkInterval: NodeJS.Timeout | null = null;

    private constructor() {
        this.startMonitoring();
    }

    public static getInstance(): ConnectivityService {
        if (!ConnectivityService.instance) {
            ConnectivityService.instance = new ConnectivityService();
        }
        return ConnectivityService.instance;
    }

    public async checkConnection(): Promise<ConnectivityStatus> {
        try {
            // Simple ping to Supabase to check real connectivity
            const { error } = await supabase.from('users').select('count', { count: 'exact', head: true }).limit(1);
            const newStatus = error ? 'offline' : 'online';
            
            if (newStatus !== this.status) {
                this.status = newStatus;
                this.notifyListeners();
            }
            return this.status;
        } catch {
            if (this.status !== 'offline') {
                this.status = 'offline';
                this.notifyListeners();
            }
            return 'offline';
        }
    }

    private startMonitoring() {
        if (this.checkInterval) return;
        
        // Initial check
        this.checkConnection();

        // Check every 30 seconds
        this.checkInterval = setInterval(() => {
            this.checkConnection();
        }, 30000);
    }

    public stopMonitoring() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
    }

    public getStatus(): ConnectivityStatus {
        return this.status;
    }

    public addListener(listener: ConnectivityListener) {
        this.listeners.push(listener);
        listener(this.status);
    }

    public removeListener(listener: ConnectivityListener) {
        this.listeners = this.listeners.filter(l => l !== listener);
    }

    private notifyListeners() {
        this.listeners.forEach(l => l(this.status));
    }
}
