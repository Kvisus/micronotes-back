import { JwtPayload } from "../../../shared/types";

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-jwt-secret-key";
process.env.JWT_REFRESH_SECRET = "test-jwt-refresh-secret-key";
process.env.JWT_EXPIRES_IN = "15m";
process.env.JWT_REFRESH_EXPIRES_IN = "7d";
process.env.BCRYPT_ROUNDS = "4";

// mock prisma
const mockPrismaClient = {
  user: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
    delete: jest.fn(),
  },
  refreshToken: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  },
  $disconnect: jest.fn(),
  $connect: jest.fn(),
};

// mock db module
jest.mock("../src/database", () => mockPrismaClient);

// mock test utils
global.mockPrisma = mockPrismaClient;

// global data for test
export const testUser = {
  id: "test-user-id",
  email: "testuser123@example.com",
  password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", //hashed password
  createdAt: new Date("2025-01-01T00:00:00Z"),
  updatedAt: new Date("2025-01-01T00:00:00Z"),
};

export const testRefreshToken = {
  id: "test-refresh-token-id",
  userId: testUser.id,
  token: "test-refresh-token",
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  createdAt: new Date(),
};

export const testJwtPayload: JwtPayload = {
  userId: testUser.id,
  email: testUser.email,
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 60 * 15, // 15 minutes
};

//helper fn to reset mocks
export function resetAllMocks() {
  Object.values(mockPrismaClient.user).forEach((mock) => {
    if (jest.isMockFunction(mock)) {
      mock.mockReset();
    }
  });
  Object.values(mockPrismaClient.refreshToken).forEach((mock) => {
    if (jest.isMockFunction(mock)) {
      mock.mockReset();
    }
  });
}

declare global {
  var mockPrisma: typeof mockPrismaClient;
}
