import { SupabaseChildRepository } from '../infrastructure/enrollment/repositories/SupabaseChildRepository';
import { SupabaseClassRepository } from '../infrastructure/activity/repositories/SupabaseClassRepository';
import { MockClassRepository } from '../infrastructure/activity/repositories/MockClassRepository';
import { supabase } from '../infrastructure/supabase/client';
import { Child } from '../domain/enrollment/entities/Child';
import { ChildName } from '../domain/enrollment/value-objects/ChildName';
import { Class, WeeklySchedule } from '../domain/activity/entities/Class';

// Mock Supabase
jest.mock('../infrastructure/supabase/client', () => {
    const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        single: jest.fn(),
        upsert: jest.fn()
    };
    return { supabase: mockSupabase };
});

// Mock Storage
jest.mock('../infrastructure/storage/SqliteStorageService', () => ({
    SqliteStorageService: {
        getInstance: jest.fn().mockReturnValue({
            run: jest.fn().mockResolvedValue(undefined),
            query: jest.fn().mockResolvedValue([]),
        })
    }
}));

describe('SupabaseChildRepository', () => {
    let repository: SupabaseChildRepository;

    beforeEach(() => {
        jest.clearAllMocks();
        repository = new SupabaseChildRepository();
    });

    it('should map children properties in correct constructor order', async () => {
        const mockChildData = {
            id: 'child-123',
            name: 'Luiz Silva',
            birth_date: '2020-05-15',
            class_id: 'class-456',
            photo_url: 'https://supabase.co/photo.jpg'
        };

        const fromSpy = jest.spyOn(supabase, 'from').mockReturnValue({
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: mockChildData, error: null })
        } as any);

        const child = await repository.findById('child-123');

        expect(child).not.toBeNull();
        expect(child!.id).toBe('child-123');
        expect(child!.name.value).toBe('Luiz Silva');
        expect(child!.birthDate!.toISOString().split('T')[0]).toBe('2020-05-15');
        expect(child!.classId).toBe('class-456');
        expect(child!.photoUrl).toBe('https://supabase.co/photo.jpg');
    });
});

describe('SupabaseClassRepository', () => {
    let repository: SupabaseClassRepository;

    beforeEach(() => {
        jest.clearAllMocks();
        repository = new SupabaseClassRepository();
    });

    it('should fetch and map all classes in alphabetical order', async () => {
        const mockClasses = [
            {
                id: 'class-1',
                name: 'Arts Class',
                description: 'Creative arts',
                age_range: '3-5 years',
                weekly_schedule: { days: ['MON', 'WED'], startTime: '09:00', endTime: '12:00' }
            },
            {
                id: 'class-2',
                name: 'Math Class',
                description: 'Fun counting',
                age_range: '4-6 years',
                weekly_schedule: { days: ['TUE', 'THU'], startTime: '10:00', endTime: '13:00' }
            }
        ];

        jest.spyOn(supabase, 'from').mockReturnValue({
            select: jest.fn().mockReturnThis(),
            order: jest.fn().mockResolvedValue({ data: mockClasses, error: null })
        } as any);

        const classes = await repository.findAll();

        expect(classes).toHaveLength(2);
        expect(classes[0].name).toBe('Arts Class');
        expect(classes[0].weeklySchedule.days).toEqual(['MON', 'WED']);
        expect(classes[1].name).toBe('Math Class');
    });

    it('should query classes by ids', async () => {
        const mockClasses = [
            {
                id: 'class-1',
                name: 'Arts Class',
                weekly_schedule: { days: ['MON'], startTime: '09:00', endTime: '12:00' }
            }
        ];

        jest.spyOn(supabase, 'from').mockReturnValue({
            select: jest.fn().mockReturnThis(),
            in: jest.fn().mockResolvedValue({ data: mockClasses, error: null })
        } as any);

        const classes = await repository.findByIds(['class-1']);
        expect(classes).toHaveLength(1);
        expect(classes[0].id).toBe('class-1');
    });
});

describe('MockClassRepository', () => {
    let repository: MockClassRepository;

    beforeEach(() => {
        repository = MockClassRepository.getInstance();
    });

    it('should list all classes in the mock', async () => {
        const classes = await repository.findAll();
        expect(classes.length).toBeGreaterThan(0);
    });

    it('should find classes without monitor in the mock', async () => {
        const classes = await repository.findAllWithoutMonitor();
        expect(classes.length).toBeGreaterThan(0);
        classes.forEach(c => {
            expect(c.monitorId).toBeUndefined();
        });
    });
});
