import { SyncQueueRepository, SyncAction } from './SyncQueueRepository';

export class SyncManager {
    private static instance: SyncManager;
    private queue: SyncQueueRepository;
    private isSyncing: boolean = false;

    private constructor() {
        this.queue = SyncQueueRepository.getInstance();
    }

    public static getInstance(): SyncManager {
        if (!SyncManager.instance) {
            SyncManager.instance = new SyncManager();
        }
        return SyncManager.instance;
    }

    public async sync(): Promise<void> {
        if (this.isSyncing) return;
        
        const pending = await this.queue.getPendingActions();
        if (pending.length === 0) return;

        this.isSyncing = true;
        console.log(`Starting sync of ${pending.length} items...`);

        try {
            for (const action of pending) {
                await this.processAction(action);
            }
        } finally {
            this.isSyncing = false;
            console.log('Sync process finished');
        }
    }

    private async processAction(action: SyncAction): Promise<void> {
        try {
            console.log(`Syncing action: ${action.actionType} (ID: ${action.id})`);
            
            // SIMULATION: In a real app, we would use fetch/axios here
            // We'll simulate a 1-second network delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Simulating success
            await this.queue.updateStatus(action.id!, 'synced');
            console.log(`Action ${action.id} synced successfully`);
            
            // In a real scenario, we might want to remove it instead of just marking as synced
            // await this.queue.remove(action.id!);
        } catch (error) {
            console.error(`Failed to sync action ${action.id}`, error);
            const newRetryCount = action.retryCount + 1;
            await this.queue.updateStatus(action.id!, 'error', newRetryCount);
        }
    }
}
