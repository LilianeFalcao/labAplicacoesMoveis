import { ClassAccessRequest, AccessRequestStatus } from '@/domain/activity/entities/ClassAccessRequest';

describe('ClassAccessRequest', () => {
    it('should create a pending access request', () => {
        const monitorId = 'monitor-1';
        const classId = 'class-1';
        const request = ClassAccessRequest.create(monitorId, classId);

        expect(request.monitorId).toBe(monitorId);
        expect(request.classId).toBe(classId);
        expect(request.status).toBe(AccessRequestStatus.PENDING);
        expect(request.requestedAt).toBeInstanceOf(Date);
    });

    it('should allow approving a request', () => {
        const request = ClassAccessRequest.create('m1', 'c1');
        request.approve();
        expect(request.status).toBe(AccessRequestStatus.APPROVED);
    });

    it('should allow rejecting a request', () => {
        const request = ClassAccessRequest.create('m1', 'c1');
        request.reject();
        expect(request.status).toBe(AccessRequestStatus.REJECTED);
    });
});
