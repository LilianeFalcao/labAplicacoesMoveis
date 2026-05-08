import { IChildRepository } from '../../../domain/enrollment/repositories/IChildRepository';
import { Child } from '../../../domain/enrollment/entities/Child';
import { ChildName } from '../../../domain/enrollment/value-objects/ChildName';
import { SqliteStorageService } from '../../storage/SqliteStorageService';

export class MockChildRepository implements IChildRepository {
    private static instance: MockChildRepository;
    private storage: SqliteStorageService;

    private constructor() {
        this.storage = SqliteStorageService.getInstance();
        this.seed();
    }

    private async seed() {
        const existing = await this.storage.query('SELECT COUNT(*) as count FROM children');
        if ((existing[0] as any).count > 0) return;

        const initialChildren = [
            { id: 'c1', name: 'Alice Silva', classId: '101', alerts: ['Alergia a Amendoim', 'Intolerância a Lactose'] },
            { id: 'c2', name: 'Bruno Costa', classId: '101', alerts: [] },
            { id: 'c3', name: 'Carla Dias', classId: '101', alerts: ['Usa Inalador (Asma)'] },
            { id: 'c4', name: 'Daniel Souza', classId: '101', alerts: [] },
            { id: 'c5', name: 'Eduardo Lima', classId: '102', alerts: [] },
            { id: 'c6', name: 'Fernanda Rocha', classId: '102', alerts: [] },
            { id: 'c7', name: 'Gabriel Neves', classId: '102', alerts: [] },
            { id: 'c8', name: 'Helena Castro', classId: '102', alerts: [] },
            { id: 'c9', name: 'Igor Santos', classId: '104', alerts: [] },
            { id: 'c10', name: 'Julia Ferreira', classId: '104', alerts: [] },
        ];

        for (const c of initialChildren) {
            await this.storage.run(
                'INSERT INTO children (id, name, age_group, medical_alerts) VALUES (?, ?, ?, ?)',
                [c.id, c.name, 'Regular', JSON.stringify(c.alerts)]
            );
        }
    }

    public static getInstance(): MockChildRepository {
        if (!MockChildRepository.instance) {
            MockChildRepository.instance = new MockChildRepository();
        }
        return MockChildRepository.instance;
    }

    async findById(id: string): Promise<Child | null> {
        const rows = await this.storage.query<any>('SELECT * FROM children WHERE id = ?', [id]);
        if (rows.length === 0) return null;
        
        const row = rows[0];
        return new Child(
            row.id, 
            ChildName.create(row.name), 
            new Date(), 
            row.age_group, 
            row.photo_uri, 
            JSON.parse(row.medical_alerts || '[]')
        );
    }

    async findByClass(classId: string): Promise<Child[]> {
        const rows = await this.storage.query<any>('SELECT * FROM children WHERE id LIKE ? OR id IN (SELECT id FROM children WHERE age_group = ?)', [classId, classId]);
        // Note: The mock data above uses '101', '102', '104' as classId in the original, 
        // but the table schema I created has id, name, age_group. 
        // Let's adjust the query to match the mock logic.
        const allRows = await this.storage.query<any>('SELECT * FROM children');
        
        // Simplified mapping for the mock/demo
        return allRows
            .filter(row => {
                // Mock class mapping logic
                if (classId === '101') return ['c1', 'c2', 'c3', 'c4'].includes(row.id);
                if (classId === '102') return ['c5', 'c6', 'c7', 'c8'].includes(row.id);
                if (classId === '104') return ['c9', 'c10'].includes(row.id);
                return false;
            })
            .map(row => new Child(
                row.id, 
                ChildName.create(row.name), 
                new Date(), 
                row.age_group, 
                row.photo_uri, 
                JSON.parse(row.medical_alerts || '[]')
            ));
    }

    async save(child: Child): Promise<void> {
        await this.storage.run(
            'INSERT OR REPLACE INTO children (id, name, age_group, medical_alerts, photo_uri) VALUES (?, ?, ?, ?, ?)',
            [child.id, child.name.value, child.classId, JSON.stringify(child.medicalAlerts), child.photoUrl]
        );
    }
}
