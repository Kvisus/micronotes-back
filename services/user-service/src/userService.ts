import { UpdateProfileRequest, UserProfile } from "../../../shared/types";
import { AuthClient } from "./authClient";
import prisma from "./database";
import { createServiceError, sanitizeInput } from "../../../shared/utils";

export class UserService {
  private authClient: AuthClient;

  constructor() {
    this.authClient = new AuthClient();
  }

  async createUserProfile(
    userId: string,
    profileData: Partial<UpdateProfileRequest>
  ): Promise<UserProfile> {
    const existingProfile = await prisma.userProfile.findUnique({
      where: {
        userId,
      },
    });

    if (existingProfile) {
      throw createServiceError("User profile already exists", 409);
    }

    const sanitizedData = this.sanitizeProfileData(profileData);

    const profile = await prisma.userProfile.create({
      data: {
        userId,
        ...sanitizedData,
      },
    });

    return profile;
  }
  private sanitizeProfileData(
    data: Partial<UpdateProfileRequest>
  ): Partial<UpdateProfileRequest> {
    const sanitized: any = {};

    if (data.firstName !== undefined) {
      sanitized.firstName = data.firstName
        ? sanitizeInput(data.firstName)
        : null;
    }
    if (data.lastName !== undefined) {
      sanitized.lastName = data.lastName ? sanitizeInput(data.lastName) : null;
    }
    if (data.bio !== undefined) {
      sanitized.bio = data.bio ? sanitizeInput(data.bio) : null;
    }
    if (data.avatarUrl !== undefined) {
      sanitized.avatarUrl = data.avatarUrl
        ? sanitizeInput(data.avatarUrl)
        : null;
    }
    if (data.preferences !== undefined) {
      sanitized.preferences = data.preferences
        ? this.sanitizePreferences(data.preferences)
        : null;
    }
    return sanitized;
  }

  private sanitizePreferences(preferences: any): any {
    if (!preferences || typeof preferences !== "object") {
      return preferences;
    }

    const sanitized: any = {};
    for (const key in preferences) {
      if (preferences.hasOwnProperty(key)) {
        const value = preferences[key];
        if (typeof value === "string") {
          sanitized[key] = sanitizeInput(value);
        } else if (typeof value === "object" && value !== null) {
          sanitized[key] = this.sanitizePreferences(value);
        } else {
          sanitized[key] = value;
        }
      }
    }
    return sanitized;
  }

  async updateUserProfile(
    userId: string,
    profileData: Partial<UpdateProfileRequest>
  ): Promise<UserProfile> {
    const existingProfile = await prisma.userProfile.findUnique({
      where: {
        userId,
      },
    });

    if (!existingProfile) {
      return this.createUserProfile(userId, profileData);
    }

    const sanitizedData = this.sanitizeProfileData(profileData);

    const updatedProfile = await prisma.userProfile.update({
      where: {
        userId,
      },
      data: sanitizedData,
    });
    return updatedProfile;
  }

  async deleteUserProfile(userId: string): Promise<void> {
    const profile = await prisma.userProfile.findUnique({
      where: {
        userId,
      },
    });
    if (!profile) {
      throw createServiceError("User profile not found", 404);
    }
    await prisma.userProfile.delete({
      where: {
        userId,
      },
    });
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const profile = await prisma.userProfile.findUnique({
      where: {
        userId,
      },
    });

    if (!profile) {
      throw createServiceError("User profile not found", 404);
    }

    return profile;
  }
}
