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
      sanitized.preferences = data.preferences ? data.preferences : null;
    }
    return sanitized;
  }
}
