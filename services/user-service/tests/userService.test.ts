import { UserService } from "../src/userService";
// mock external dependencies

jest.mock("../src/authClient");

import axios from "axios";
import { AuthClient } from "../src/authClient";
import { ServiceError } from "../../../shared/types";
import {
  resetAllMocks,
  testUpdatedUserProfileRequest,
  testUserProfile,
} from "./setup";

const MockedAuthClient = AuthClient as jest.MockedClass<typeof AuthClient>;

async function expectServiceError(
  asyncFn: () => Promise<any>,
  errorMessage: string,
  statusCode: number
) {
  try {
    await asyncFn();
    fail("Expected service error but no error was thrown");
  } catch (error) {
    expect(error).toBeInstanceOf(ServiceError);
    const serviceError = error as ServiceError;
    expect(serviceError.message).toBe(errorMessage);
    expect(serviceError.statusCode).toBe(statusCode);
  }
}

describe("UserService", () => {
  let userService: UserService;
  let mockAuthClient: jest.Mocked<AuthClient>;

  beforeAll(() => {
    resetAllMocks();
    // userService = new UserService();
    mockAuthClient = {
      validateToken: jest.fn(),
    } as any;
    MockedAuthClient.mockImplementation(() => mockAuthClient);

    userService = new UserService();
  });

  describe("Create User Profile", () => {
    const userId = "test-user-id-user-service";
    const profileData = {
      firstName: "John",
      lastName: "Doe",
      bio: "I am a test user",
      avatarUrl: "https://example.com/avatar.jpg",
      preferences: {
        theme: "light",
        language: "en",
      },
    };

    it("should create a new user profile", async () => {
      global.mockPrisma.userProfile.findUnique.mockResolvedValue(null);
      global.mockPrisma.userProfile.create.mockResolvedValue(testUserProfile);

      const result = await userService.createUserProfile(userId, profileData);
      expect(global.mockPrisma.userProfile.findUnique).toHaveBeenCalledWith({
        where: {
          userId,
        },
      });
      expect(global.mockPrisma.userProfile.create).toHaveBeenCalledWith({
        data: {
          userId,
          ...profileData,
        },
      });
      expect(result).toEqual(testUserProfile);
    });

    it("should throw an error if user profile already exists", async () => {
      global.mockPrisma.userProfile.findUnique.mockResolvedValue(
        testUserProfile
      );
      await expectServiceError(
        () => userService.createUserProfile(userId, profileData),
        "User profile already exists",
        409
      );
      expect(global.mockPrisma.userProfile.create).not.toHaveBeenCalled();
    });

    it("should sanitize profile data before creating", async () => {
      const unsanitizedData = {
        ...profileData,
        bio: "<script>alert('XSS')</script>",
        preferences: {
          theme: "<script>alert('XSS')</script>",
          language: "<script>alert('XSS')</script>",
        },
      };
      global.mockPrisma.userProfile.findUnique.mockResolvedValue(null);
      global.mockPrisma.userProfile.create.mockResolvedValue(testUserProfile);
      const result = await userService.createUserProfile(
        userId,
        unsanitizedData
      );
      expect(result).toEqual(testUserProfile);
      expect(global.mockPrisma.userProfile.create).toHaveBeenCalledWith({
        data: {
          userId,
          firstName: "John",
          lastName: "Doe",
          bio: "script alert('XSS') /script",
          avatarUrl: "https://example.com/avatar.jpg",
          preferences: {
            theme: "script alert('XSS') /script",
            language: "script alert('XSS') /script",
          },
        },
      });
    });
  });

  describe("Update User Profile", () => {
    const userId = "test-user-id-user-service";

    it("should update an existing user profile", async () => {
      global.mockPrisma.userProfile.findUnique.mockResolvedValue(
        testUserProfile
      );
      global.mockPrisma.userProfile.update.mockResolvedValue({
        ...testUserProfile,
        ...testUpdatedUserProfileRequest,
      });
    });

    it("should create a new user profile if it doesn't exist", async () => {
      global.mockPrisma.userProfile.findUnique.mockResolvedValue(null);
      global.mockPrisma.userProfile.create.mockResolvedValue(testUserProfile);

      const result = await userService.updateUserProfile(
        userId,
        testUpdatedUserProfileRequest
      );
      expect(global.mockPrisma.userProfile.findUnique).toHaveBeenCalledWith({
        where: {
          userId,
        },
      });
      expect(global.mockPrisma.userProfile.create).toHaveBeenCalledWith({
        data: {
          userId,
          ...testUpdatedUserProfileRequest,
        },
      });
      expect(result).toEqual(testUserProfile);
    });
  });

  describe("Get User Profile", () => {
    const userId = "test-user-id-user-service";

    it("should get an existing user profile", async () => {
      global.mockPrisma.userProfile.findUnique.mockResolvedValue(
        testUserProfile
      );
      const result = await userService.getUserProfile(userId);
      expect(global.mockPrisma.userProfile.findUnique).toHaveBeenCalledWith({
        where: {
          userId,
        },
      });
      expect(result).toEqual(testUserProfile);
    });

    it("should throw an error if user profile doesn't exist", async () => {
      global.mockPrisma.userProfile.findUnique.mockResolvedValue(null);
      await expectServiceError(
        () => userService.getUserProfile(userId),
        "User profile not found",
        404
      );
    });
  });
});
