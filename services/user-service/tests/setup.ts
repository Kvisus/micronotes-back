import axios from "axios";

process.env.NODE_ENV = "test";
process.env.AUTH_SERVICE_URL = "http://localhost:3001";

// mock prisma
const mockPrismaClient = {
  userProfile: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
    delete: jest.fn(),
  },
  $disconnect: jest.fn(),
  $connect: jest.fn(),
};

// mock db module
jest.mock("../src/database", () => mockPrismaClient);

// axios mock
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

// mock test utils
global.mockPrisma = mockPrismaClient;
global.mockAxios = mockedAxios;

// reset mocks
beforeEach(() => {
  resetAllMocks();
});

// global data for test
export const testUserProfile = {
  id: "test-user-id-user-service",
  userId: "test-user-id-auth-service",
  firstName: "John",
  lastName: "Doe",
  bio: "I am a test user",
  avatarUrl: "https://example.com/avatar.jpg",
  preferences: {
    theme: "light",
    language: "en",
  },
  createdAt: new Date("2025-01-01T00:00:00Z"),
  updatedAt: new Date("2025-01-01T00:00:00Z"),
};

export const testUpdatedUserProfileRequest = {
  firstName: "Jane",
  lastName: "Doe",
  bio: "I am a test user",
  avatarUrl: "https://example2.com/avatar.jpg",
  preferences: {
    theme: "dark",
    language: "es",
  },
};

export const testJwtPayload = {
  userId: testUserProfile.userId,
  email: "testuser123@example.com",
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 60 * 15, // 15 minutes
};

//helper fn to reset mocks
export function resetAllMocks() {
  Object.values(mockPrismaClient.userProfile).forEach((mock) => {
    if (jest.isMockFunction(mock)) {
      mock.mockReset();
    }
  });
  mockedAxios.post.mockReset();
}

declare global {
  var mockPrisma: typeof mockPrismaClient;
  var mockAxios: typeof axios;
}
