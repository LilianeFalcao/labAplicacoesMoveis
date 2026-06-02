import { SupabaseChildRepository } from '../infrastructure/enrollment/repositories/SupabaseChildRepository';
import { SupabaseClassRepository } from '../infrastructure/activity/repositories/SupabaseClassRepository';
import { SupabaseUserRepository } from '../infrastructure/identity/repositories/SupabaseUserRepository';
import { SupabaseGuardianRepository } from '../infrastructure/enrollment/repositories/SupabaseGuardianRepository';
import { SupabaseAttendanceRepository } from '../infrastructure/attendance/repositories/SupabaseAttendanceRepository';
import { supabase } from '../infrastructure/supabase/client';
import { Child } from '../domain/enrollment/entities/Child';
import { ChildName } from '../domain/enrollment/value-objects/ChildName';
import { Class, WeeklySchedule } from '../domain/activity/entities/Class';
import { User } from '../domain/identity/entities/User';
import { Email } from '../domain/identity/value-objects/Email';
import { Role } from '../domain/identity/value-objects/Role';
import { Guardian } from '../domain/enrollment/entities/Guardian';
import { AttendanceRecord } from '../domain/attendance/entities/AttendanceRecord';
import { AttendanceStatus } from '../domain/attendance/value-objects/AttendanceStatus';

// Mock SQLite Storage
const mockStorageInstance = {
    run: jest.fn().mockResolvedValue(undefined),
    query: jest.fn().mockResolvedValue([]),
};

jest.mock('../infrastructure/storage/SqliteStorageService', () => ({
    SqliteStorageService: {
        getInstance: () => mockStorageInstance,
    },
}));

// Mock Supabase Chainable/Thenable Query Object
const mockQueryObj = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    not: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockReturnThis(),
    then: jest.fn(),
};

const mockChannel = {
    on: jest.fn().mockReturnThis(),
    subscribe: jest.fn(),
};

jest.mock('../infrastructure/supabase/client', () => {
    return {
        supabase: {
            from: jest.fn().mockImplementation(() => mockQueryObj),
            channel: jest.fn().mockImplementation(() => mockChannel),
            removeChannel: jest.fn(),
        }
    };
});

describe('SupabaseChildRepository', () => {
    let repository: SupabaseChildRepository;

    beforeEach(() => {
        jest.clearAllMocks();
        repository = new SupabaseChildRepository();
        mockQueryObj.then.mockImplementation((onFulfilled) => {
            return Promise.resolve({ data: null, error: null }).then(onFulfilled);
        });
    });

    it('should fetch and map child from Supabase on cache miss', async () => {
        const mockChildData = {
            id: 'child-123',
            name: 'Luiz Silva',
            birth_date: '2020-05-15',
            class_id: 'class-456',
            photo_url: 'https://supabase.co/photo.jpg'
        };

        mockStorageInstance.query.mockResolvedValueOnce([]); // cache miss
        mockQueryObj.then.mockImplementationOnce((onFulfilled) => {
            return Promise.resolve({ data: mockChildData, error: null }).then(onFulfilled);
        });

        const child = await repository.findById('child-123');

        expect(child).not.toBeNull();
        expect(child!.id).toBe('child-123');
        expect(child!.name.value).toBe('Luiz Silva');
        expect(mockStorageInstance.run).toHaveBeenCalledWith(
            expect.stringContaining('INSERT OR REPLACE INTO children'),
            ['child-123', 'Luiz Silva', 'class-456', 'https://supabase.co/photo.jpg']
        );
    });

    it('should find children by class, including image consent mapping', async () => {
        const mockData = [
            {
                id: 'child-1',
                name: 'Alice',
                class_id: 'class-X',
                photo_url: null,
                birth_date: null,
                guardian_children: [
                    { guardians: { image_consent: true } }
                ]
            }
        ];

        mockQueryObj.then.mockImplementationOnce((onFulfilled) => {
            return Promise.resolve({ data: mockData, error: null }).then(onFulfilled);
        });

        const children = await repository.findByClass('class-X');
        expect(children).toHaveLength(1);
        expect(children[0].id).toBe('child-1');
        expect(children[0].hasImageConsent).toBe(true);
    });

    it('should find children by guardian ID', async () => {
        const mockData = [
            { id: 'child-1', name: 'Bob', class_id: 'class-Y', photo_url: null, birth_date: null }
        ];

        mockQueryObj.then.mockImplementationOnce((onFulfilled) => {
            return Promise.resolve({ data: mockData, error: null }).then(onFulfilled);
        });

        const children = await repository.findByGuardianId('guardian-123');
        expect(children).toHaveLength(1);
        expect(children[0].name.value).toBe('Bob');
    });

    it('should fetch all children', async () => {
        const mockData = [{ id: 'child-1', name: 'Bob', class_id: 'class-Y', photo_url: null, birth_date: null }];
        mockQueryObj.then.mockImplementationOnce((onFulfilled) => {
            return Promise.resolve({ data: mockData, error: null }).then(onFulfilled);
        });

        const children = await repository.findAll();
        expect(children).toHaveLength(1);
    });

    it('should save a child', async () => {
        const child = new Child('c1', ChildName.create('Carlos'), new Date('2018-01-01'), 'class-1');
        
        mockQueryObj.then.mockImplementationOnce((onFulfilled) => {
            return Promise.resolve({ error: null }).then(onFulfilled);
        });

        await repository.save(child);
        expect(supabase.from).toHaveBeenCalledWith('children');
        expect(mockStorageInstance.run).toHaveBeenCalled();
    });
});

describe('SupabaseClassRepository', () => {
    let repository: SupabaseClassRepository;

    beforeEach(() => {
        jest.clearAllMocks();
        repository = new SupabaseClassRepository();
        mockQueryObj.then.mockImplementation((onFulfilled) => {
            return Promise.resolve({ data: null, error: null }).then(onFulfilled);
        });
    });

    it('should find class by ID successfully', async () => {
        const mockClass = {
            id: 'class-1',
            name: 'Maternal A',
            weekly_schedule: { days: ['MON', 'WED'], startTime: '08:00', endTime: '12:00' }
        };

        mockQueryObj.then.mockImplementationOnce((onFulfilled) => {
            return Promise.resolve({ data: mockClass, error: null }).then(onFulfilled);
        });

        const cls = await repository.findById('class-1');
        expect(cls).not.toBeNull();
        expect(cls!.name).toBe('Maternal A');
    });

    it('should fall back to offline class when online fetch fails', async () => {
        mockQueryObj.then.mockImplementationOnce((onFulfilled) => {
            return Promise.resolve({ data: null, error: new Error('Network error') }).then(onFulfilled);
        });
        const cls = await repository.findById('class-1');
        expect(cls).not.toBeNull();
        expect(cls!.name).toBe('Turma Offline');
    });

    it('should fetch classes by monitor ID', async () => {
        // Step 1: fetch monitor_activities
        mockQueryObj.then.mockImplementationOnce((onFulfilled) => {
            return Promise.resolve({ data: [{ class_id: 'class-1' }], error: null }).then(onFulfilled);
        });
        // Step 2: fetch classes by ids
        mockQueryObj.then.mockImplementationOnce((onFulfilled) => {
            return Promise.resolve({ data: [{ id: 'class-1', name: 'Classe 1' }], error: null }).then(onFulfilled);
        });

        const classes = await repository.findByMonitorId('monitor-123');
        expect(classes).toHaveLength(1);
        expect(classes[0].name).toBe('Classe 1');
    });

    it('should fetch all classes without monitor assigned', async () => {
        const allMock = [
            { id: 'class-1', name: 'Classe 1' },
            { id: 'class-2', name: 'Classe 2' }
        ];

        // Step 1: findAll
        mockQueryObj.then.mockImplementationOnce((onFulfilled) => {
            return Promise.resolve({ data: allMock, error: null }).then(onFulfilled);
        });
        // Step 2: assignments
        mockQueryObj.then.mockImplementationOnce((onFulfilled) => {
            return Promise.resolve({ data: [{ class_id: 'class-1' }], error: null }).then(onFulfilled);
        });

        const classes = await repository.findAllWithoutMonitor();
        expect(classes).toHaveLength(1);
        expect(classes[0].id).toBe('class-2');
    });

    it('should save class details', async () => {
        const cls = new Class('class-1', 'Jardim A', new WeeklySchedule(['MON'], '08:00', '12:00'));
        
        mockQueryObj.then.mockImplementationOnce((onFulfilled) => {
            return Promise.resolve({ error: null }).then(onFulfilled);
        });

        await repository.save(cls);
        expect(supabase.from).toHaveBeenCalledWith('classes');
    });

    it('should assign classes to a monitor', async () => {
        // Step 1: delete
        mockQueryObj.then.mockImplementationOnce((onFulfilled) => {
            return Promise.resolve({ error: null }).then(onFulfilled);
        });
        // Step 2: insert
        mockQueryObj.then.mockImplementationOnce((onFulfilled) => {
            return Promise.resolve({ error: null }).then(onFulfilled);
        });

        await repository.assignClassesToMonitor('monitor-123', [{ classId: 'class-1', isPrimary: true }]);
        expect(supabase.from).toHaveBeenCalledWith('monitor_activities');
    });
});

describe('SupabaseUserRepository', () => {
    let repository: SupabaseUserRepository;

    beforeEach(() => {
        jest.clearAllMocks();
        repository = new SupabaseUserRepository();
        mockQueryObj.then.mockImplementation((onFulfilled) => {
            return Promise.resolve({ data: null, error: null }).then(onFulfilled);
        });
    });

    it('should find user by id', async () => {
        const mockUser = { id: 'u-1', email: 'test@bambole.app', role: 'admin', full_name: 'Admin' };
        mockQueryObj.then.mockImplementationOnce((onFulfilled) => {
            return Promise.resolve({ data: mockUser, error: null }).then(onFulfilled);
        });

        const user = await repository.findById('u-1');
        expect(user).not.toBeNull();
        expect(user!.fullName).toBe('Admin');
        expect(user!.role.value).toBe('admin');
    });

    it('should find user by email', async () => {
        const mockUser = { id: 'u-1', email: 'parent@bambole.app', role: 'parent' };
        mockQueryObj.then.mockImplementationOnce((onFulfilled) => {
            return Promise.resolve({ data: mockUser, error: null }).then(onFulfilled);
        });

        const user = await repository.findByEmail(Email.create('parent@bambole.app'));
        expect(user).not.toBeNull();
        expect(user!.id).toBe('u-1');
    });

    it('should save and create users', async () => {
        const user = new User('u-1', Email.create('test@bambole.app'), Role.create('monitor'), 'Monitor 1');
        
        mockQueryObj.then.mockImplementationOnce((onFulfilled) => {
            return Promise.resolve({ error: null }).then(onFulfilled);
        });
        await repository.save(user);

        mockQueryObj.then.mockImplementationOnce((onFulfilled) => {
            return Promise.resolve({ error: null }).then(onFulfilled);
        });
        await repository.create(user);

        expect(supabase.from).toHaveBeenCalledWith('users');
    });

    it('should fetch tokens for push notifications', async () => {
        // findAllParentTokens
        mockQueryObj.then.mockImplementationOnce((onFulfilled) => {
            return Promise.resolve({ data: [{ push_token: 'token-parent' }], error: null }).then(onFulfilled);
        });

        const parentTokens = await repository.findAllParentTokens();
        expect(parentTokens).toEqual(['token-parent']);

        // findAdminTokens
        mockQueryObj.then.mockImplementationOnce((onFulfilled) => {
            return Promise.resolve({ data: [{ push_token: 'token-admin' }], error: null }).then(onFulfilled);
        });
        const adminTokens = await repository.findAdminTokens();
        expect(adminTokens).toEqual(['token-admin']);

        // findTokensByClass
        mockQueryObj.then.mockImplementationOnce((onFulfilled) => {
            return Promise.resolve({ data: [{ push_token: 'token-class' }], error: null }).then(onFulfilled);
        });
        const classTokens = await repository.findTokensByClass('class-123');
        expect(classTokens).toEqual(['token-class']);
    });
});

describe('SupabaseGuardianRepository', () => {
    let repository: SupabaseGuardianRepository;

    beforeEach(() => {
        jest.clearAllMocks();
        repository = new SupabaseGuardianRepository();
        mockQueryObj.then.mockImplementation((onFulfilled) => {
            return Promise.resolve({ data: null, error: null }).then(onFulfilled);
        });
    });

    it('should find guardian by id', async () => {
        const mockGuardian = { id: 'g-1', user_id: 'u-1', image_consent: true, image_consent_at: '2026-06-01' };
        mockQueryObj.then.mockImplementationOnce((onFulfilled) => {
            return Promise.resolve({ data: mockGuardian, error: null }).then(onFulfilled);
        });

        const guardian = await repository.findById('g-1');
        expect(guardian).not.toBeNull();
        expect(guardian!.imageConsent).toBe(true);
    });

    it('should find guardian by user id or create fallback', async () => {
        // Step 1: select fails
        mockQueryObj.then.mockImplementationOnce((onFulfilled) => {
            return Promise.resolve({ data: null, error: new Error('Not found') }).then(onFulfilled);
        });
        // Step 2: insert & select single
        mockQueryObj.then.mockImplementationOnce((onFulfilled) => {
            return Promise.resolve({ data: { id: 'g-new', user_id: 'u-1', image_consent: false }, error: null }).then(onFulfilled);
        });

        const guardian = await repository.findByUserId('u-1');
        expect(guardian).not.toBeNull();
        expect(guardian!.id).toBe('g-new');
    });

    it('should find guardian by email', async () => {
        // Step 1: find user
        mockQueryObj.then.mockImplementationOnce((onFulfilled) => {
            return Promise.resolve({ data: { id: 'u-parent' }, error: null }).then(onFulfilled);
        });
        // Step 2: find guardian
        mockQueryObj.then.mockImplementationOnce((onFulfilled) => {
            return Promise.resolve({ data: { id: 'g-1', user_id: 'u-parent', image_consent: true }, error: null }).then(onFulfilled);
        });

        const guardian = await repository.findByUserEmail('parent@bambole.app');
        expect(guardian).not.toBeNull();
        expect(guardian!.id).toBe('g-1');
    });

    it('should save and link guardians', async () => {
        mockQueryObj.then.mockImplementationOnce((onFulfilled) => {
            return Promise.resolve({ error: null }).then(onFulfilled);
        });
        const guardian = new Guardian('g-1', 'u-1', true);
        await repository.save(guardian);

        mockQueryObj.then.mockImplementationOnce((onFulfilled) => {
            return Promise.resolve({ error: null }).then(onFulfilled);
        });
        await repository.linkToChild('g-1', 'child-1');

        expect(supabase.from).toHaveBeenCalledWith('guardians');
    });
});

describe('SupabaseAttendanceRepository', () => {
    let repository: SupabaseAttendanceRepository;

    beforeEach(() => {
        jest.clearAllMocks();
        repository = new SupabaseAttendanceRepository();
        mockQueryObj.then.mockImplementation((onFulfilled) => {
            return Promise.resolve({ data: null, error: null }).then(onFulfilled);
        });
    });

    it('should save attendance online and fallback offline on network failure', async () => {
        const record = new AttendanceRecord(
            'att-1',
            'child-1',
            'class-1',
            'monitor-1',
            new Date(),
            AttendanceStatus.create('present'),
            { lat: 10, lng: 20 }
        );

        // Simulate online fail
        mockQueryObj.then.mockImplementationOnce((onFulfilled) => {
            return Promise.resolve({ error: new Error('Network error') }).then(onFulfilled);
        });

        await repository.save(record);

        // Should fallback to local sync queue
        expect(mockStorageInstance.run).toHaveBeenCalledWith(
            expect.stringContaining('INSERT INTO sync_queue'),
            expect.any(Array)
        );
    });

    it('should find attendance by class and date', async () => {
        mockStorageInstance.query.mockResolvedValueOnce([]); // cache miss
        const mockData = [{ id: 'att-1', child_id: 'c-1', class_id: 'cl-1', date: '2026-06-01', status: 'present' }];
        
        mockQueryObj.then.mockImplementationOnce((onFulfilled) => {
            return Promise.resolve({ data: mockData, error: null }).then(onFulfilled);
        });

        const records = await repository.findByClassAndDate('cl-1', '2026-06-01');
        expect(records).toHaveLength(1);
        expect(records[0].id).toBe('att-1');
    });

    it('should manage subscription and PostgreSQL changes channel', () => {
        const removeChannelSpy = jest.spyOn(supabase, 'removeChannel');
        const unsubscribe = repository.subscribe(() => {});
        expect(supabase.channel).toHaveBeenCalledWith('public:attendance_records');
        unsubscribe();
        expect(removeChannelSpy).toHaveBeenCalled();
    });
});
