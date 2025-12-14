import { AuthTokens, JwtPayload, ServiceError } from "../../../shared/types";
import prisma from "./database";
import { createServiceError } from "../../../shared/utils";
import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { StringValue } from "ms";

export class AuthService {
  private readonly jwtSecret: string;
  private readonly jwtRefreshSecret: string;
  private readonly jwtExpiresIn: string;
  private readonly jwtRefreshExpiresIn: string;
  private readonly bcryptRounds: number;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET!;
    this.jwtRefreshSecret = process.env.JWT_REFRESH_SECRET!;
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || "15m";
    this.jwtRefreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || "7d";
    this.bcryptRounds = parseInt(process.env.BCRYPT_ROUNDS || "10", 10);

    if (!this.jwtSecret || !this.jwtRefreshSecret) {
      throw new Error(
        "JWT secrets are not defined in the environment variables"
      );
    }
  }

  async register(email: string, password: string): Promise<AuthTokens> {
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      throw createServiceError("User already exists", 409, "USER_EXISTS");
    }

    const hashedPassword = await bcrypt.hash(password, this.bcryptRounds);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    return this.generateTokens(user.id, user.email);
  }

  async login(email: string, password: string): Promise<AuthTokens> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw createServiceError(
        "Invalid email or password",
        401,
        "INVALID_CREDENTIALS"
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw createServiceError(
        "Invalid email or password",
        401,
        "INVALID_CREDENTIALS"
      );
    }

    return this.generateTokens(user.id, user.email);
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const decoded = jwt.verify(
        refreshToken,
        this.jwtRefreshSecret
      ) as JwtPayload;

      const storedToken = await prisma.refreshToken.findUnique({
        where: {
          token: refreshToken,
        },
        include: {
          user: true,
        },
      });

      if (!storedToken || storedToken.expiresAt < new Date()) {
        throw createServiceError(
          "Invalid or expired refresh token",
          401,
          "INVALID_REFRESH_TOKEN"
        );
      }

      const tokens = await this.generateTokens(
        storedToken.user.id,
        storedToken.user.email
      );

      await prisma.refreshToken.delete({
        where: {
          id: storedToken.id,
        },
      });

      return tokens;
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }
      throw createServiceError(
        "Failed to refresh token",
        401,
        "TOKEN_REFRESH_FAILED"
      );
    }
  }
  async logout(refreshToken: string): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: {
        token: refreshToken,
      },
    });
  }

  async validateToken(token: string): Promise<JwtPayload> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as JwtPayload;

      const user = await prisma.user.findUnique({
        where: {
          id: decoded.userId,
        },
      });

      if (!user) {
        throw createServiceError("User not found", 404, "USER_NOT_FOUND");
      }

      return decoded;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw createServiceError("Invalid token", 401);
      }
      throw createServiceError("Failed to validate token", 500, error);
    }
  }

  private async generateTokens(
    userId: string,
    email: string
  ): Promise<AuthTokens> {
    const payload = { userId, email };

    const accessTokenOptions: SignOptions = {
      expiresIn: this.jwtExpiresIn as StringValue,
    };

    const accessToken = jwt.sign(
      payload,
      this.jwtSecret,
      accessTokenOptions
    ) as string;

    const refreshTokenOptions: SignOptions = {
      expiresIn: this.jwtRefreshExpiresIn as StringValue,
    };

    const refreshToken = jwt.sign(
      payload,
      this.jwtRefreshSecret,
      refreshTokenOptions
    ) as string;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await prisma.refreshToken.create({
      data: {
        userId,
        token: refreshToken,
        expiresAt,
      },
    });
    return { accessToken, refreshToken };
  }

  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, createdAt: true, updatedAt: true },
    });
    if (!user) {
      throw createServiceError("User not found", 404);
    }
    return user;
  }

  async deleteUser(userId: string): Promise<void> {
    await prisma.user.delete({
      where: { id: userId },
    });
  }
}
