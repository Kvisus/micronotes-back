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
import { resetAllMocks } from "./setup";

describe("authService", () => {
  let authService: AuthService;

  beforeAll(() => {
    resetAllMocks();
    authService = new AuthService();
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
    })
  });
});
