import { AuthService } from "../src/authService";
// mock external dependencies
jest.mock("bcryptjs", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}));

jest.mock("uuid", () => ({
  v4: jest.fn(),
}));

//import mocked modules
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import {
  resetAllMocks,
  testJwtPayload,
  testRefreshToken,
  testUser,
} from "./setup";
import { ServiceError } from "../../../shared/types";

const mockedUuidv4 = uuidv4 as unknown as jest.Mock<string, []>;
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;
const mockedJwt = jwt as jest.Mocked<typeof jwt>;

// fn to test service error
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

describe("authService", () => {
  let authService: AuthService;

  beforeAll(() => {
    resetAllMocks();
    authService = new AuthService();

    // setup mock implementations
    mockedUuidv4.mockReturnValue("test-uuid-111");
    (mockedBcrypt.hash as jest.Mock).mockResolvedValue("hashed-password");
    (mockedBcrypt.compare as jest.Mock).mockResolvedValue(true);
    (mockedJwt.sign as jest.Mock)
      .mockReturnValueOnce("test-access-token")
      .mockReturnValueOnce("test-refresh-token");
    (mockedJwt.verify as jest.Mock).mockReturnValue(testJwtPayload);
  });

  describe("constructor", () => {
    it("should initialize with environment variables", () => {
      expect(authService).toBeInstanceOf(AuthService);
    });

    it("should throw an error if JWT_SECRET is not configured", () => {
      delete process.env.JWT_SECRET;
      expect(() => new AuthService()).toThrow(
        "JWT secrets are not defined in the environment variables"
      );
      process.env.JWT_SECRET = "test-jwt-secret-key"; // reset for next test
    });
    it("should throw an error if JWT_REFRESH_SECRET is not configured", () => {
      delete process.env.JWT_REFRESH_SECRET;
      expect(() => new AuthService()).toThrow(
        "JWT secrets are not defined in the environment variables"
      );
      process.env.JWT_REFRESH_SECRET = "test-jwt-refresh-secret-key"; // reset for next test
    });
  });

  describe("register", () => {
    const email = "rofloemail@example.com";
    const password = "Password123!";

    it("should successfully register a new user", async () => {
      global.mockPrisma.user.findUnique.mockResolvedValue(null);
      global.mockPrisma.user.create.mockResolvedValue({ testUser });
      global.mockPrisma.refreshToken.create.mockResolvedValue(testRefreshToken);

      const result = await authService.register(email, password);

      expect(global.mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email },
      });

      expect(mockedBcrypt.hash).toHaveBeenCalledWith(password, 4);
      expect(global.mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          email,
          password: "hashed-password",
        },
      });

      expect(result).toEqual({
        accessToken: "test-access-token",
        refreshToken: "test-refresh-token",
      });
    });

    it("should throw an error if user already exists", async () => {
      global.mockPrisma.user.findUnique.mockResolvedValue(testUser);
      await expectServiceError(
        () => authService.register(email, password),
        "User already exists",
        409
      );

      expect(global.mockPrisma.user.create).not.toHaveBeenCalled();
    });

    it("should handle db error during user creation", async () => {
      global.mockPrisma.user.findUnique.mockResolvedValue(null);
      global.mockPrisma.user.create.mockRejectedValue(
        new Error("Database error")
      );
      await expect(authService.register(email, password)).rejects.toThrow(
        "Database error"
      );
    });
  });
});
