import { UploadActivityPhotoUseCase } from "../use-cases/UploadActivityPhotoUseCase";
import { GetActivityFeedUseCase } from "../use-cases/GetActivityFeedUseCase";
import { MockActivityRepository } from "../../../infrastructure/activity/repositories/MockActivityRepository";
import { ActivityPhoto } from "../../../domain/activity/entities/ActivityPhoto";

describe("Activity Use Cases", () => {
    let uploadActivityPhotoUseCase: UploadActivityPhotoUseCase;
    let getActivityFeedUseCase: GetActivityFeedUseCase;
    let repository: MockActivityRepository;

    beforeEach(() => {
        repository = MockActivityRepository.getInstance();
        repository.setPhotos([]); // Reset state for each test
        uploadActivityPhotoUseCase = new UploadActivityPhotoUseCase(repository);
        getActivityFeedUseCase = new GetActivityFeedUseCase(repository);
    });

    describe("UploadActivityPhotoUseCase", () => {
        it("should create and save a new activity photo", async () => {
            const request = {
                classId: "class-1",
                photoUri: "file://photo.jpg",
                caption: "Fun at the playground",
            };

            const result = await uploadActivityPhotoUseCase.execute(request);

            expect(result.classId).toBe(request.classId);
            expect(result.photoUri).toBe(request.photoUri);
            expect(result.caption).toBe(request.caption);

            const savedPhotos = await repository.getFeedByClass("class-1");
            expect(savedPhotos).toHaveLength(1);
            expect(savedPhotos[0].id).toBe(result.id);
        });
    });

    describe("GetActivityFeedUseCase", () => {
        it("should retrieve sorted photos for given class IDs", async () => {
            const photo1 = ActivityPhoto.create({ classId: "class-1", photoUri: "u1", timestamp: new Date("2023-01-01T10:00:00Z") });
            const photo2 = ActivityPhoto.create({ classId: "class-2", photoUri: "u2", timestamp: new Date("2023-01-01T12:00:00Z") });

            repository.setPhotos([photo1, photo2]);

            const result = await getActivityFeedUseCase.execute({ classIds: ["class-1", "class-2"] });

            expect(result).toHaveLength(2);
            expect(result[0].id).toBe(photo2.id); // Sorted by timestamp descending
            expect(result[1].id).toBe(photo1.id);
        });
    });
});
