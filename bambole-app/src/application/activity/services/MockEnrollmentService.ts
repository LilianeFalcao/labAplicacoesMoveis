export interface ChildEnrollment {
    childId: string;
    childName: string;
    classId: string;
}

export class MockEnrollmentService {
    async getChildrenClassIds(parentId: string): Promise<string[]> {
        // Mock implementation: returns a list of class IDs associated with the parent's children.
        // In a real mock session, we simulate that this parent has children in '1' (Futebol) and '3' (Natação).
        return ["1", "3"];
    }

    async getChildrenEnrollments(parentId: string): Promise<ChildEnrollment[]> {
        return [
            { childId: "c1", childName: "João", classId: "1" },
            { childId: "c2", childName: "Maria", classId: "3" },
        ];
    }
}
