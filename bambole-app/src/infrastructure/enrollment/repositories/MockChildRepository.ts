import { IChildRepository } from '../../../domain/enrollment/repositories/IChildRepository';
import { Child } from '../../../domain/enrollment/entities/Child';
import { ChildName } from '../../../domain/enrollment/value-objects/ChildName';

export class MockChildRepository implements IChildRepository {
    private static instance: MockChildRepository;
    private children: Child[] = [];

    private constructor() {
        // Mock data for classes 101, 102, 104
        this.children = [
            // Class 101
            new Child('c1', ChildName.create('Alice Silva'), new Date(2012, 5, 10), '101'),
            new Child('c2', ChildName.create('Bruno Costa'), new Date(2013, 2, 15), '101'),
            new Child('c3', ChildName.create('Carla Dias'), new Date(2012, 11, 20), '101'),
            new Child('c4', ChildName.create('Daniel Souza'), new Date(2013, 8, 5), '101'),

            // Class 102
            new Child('c5', ChildName.create('Eduardo Lima'), new Date(2014, 1, 12), '102'),
            new Child('c6', ChildName.create('Fernanda Rocha'), new Date(2014, 6, 25), '102'),
            new Child('c7', ChildName.create('Gabriel Neves'), new Date(2015, 3, 30), '102'),
            new Child('c8', ChildName.create('Helena Castro'), new Date(2014, 9, 14), '102'),

            // Class 104
            new Child('c9', ChildName.create('Igor Santos'), new Date(2011, 4, 18), '104'),
            new Child('c10', ChildName.create('Julia Ferreira'), new Date(2012, 10, 2), '104'),
        ];
    }

    public static getInstance(): MockChildRepository {
        if (!MockChildRepository.instance) {
            MockChildRepository.instance = new MockChildRepository();
        }
        return MockChildRepository.instance;
    }

    async findById(id: string): Promise<Child | null> {
        return this.children.find(c => c.id === id) || null;
    }

    async findByClass(classId: string): Promise<Child[]> {
        return this.children.filter(c => c.classId === classId);
    }

    async save(child: Child): Promise<void> {
        const index = this.children.findIndex(c => c.id === child.id);
        if (index >= 0) {
            this.children[index] = child;
        } else {
            this.children.push(child);
        }
    }
}
