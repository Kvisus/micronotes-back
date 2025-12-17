import { createServiceError } from "@shared/utils";
import axios from "axios";

export interface TagValidationResponse {
  validTags: Array<{
    id: string;
    name: string;
    color?: string;
    userId: string;
    createdAt: Date;
  }>;
  invalidTags: string[];
}

export class TagServiceClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.TAGS_SERVICE_URL || "http://localhost:3004";
  }

  async validateTags(
    tagIds: string[],
    authToken: string
  ): Promise<TagValidationResponse> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/tags/validate`,
        { tagIds },
        {
          headers: {
            "Content-Type": "application/json",  
            Authorization: `Bearer ${authToken}`,
          },
          timeout: 5000,
        }
      );
      if (!response.data.success) {
        throw createServiceError("Failed to validate tags", 500);
      }
      return response.data.data;
    } catch (error) {
      if (error.response) {
        const statusCode = error.response?.status || 500;
        const errorMessage =
          error.response?.data?.error || "Failed to validate tags";
        throw createServiceError(errorMessage, statusCode);
      } else if (error.request) {
        throw createServiceError("Failed to connect to tags service", 503);
      } else {
        throw createServiceError("An unexpected error occurred", 500);
      }
    }
  }

  async getTagsByIds(
    tags: string[],
    authToken: string
  ): Promise<
    Array<{
      id: string;
      name: string;
      color?: string;
      userId: string;
      createdAt: Date;
    }>
  > {
    const validation = await this.validateTags(tags, authToken);

    if (validation.invalidTags.length > 0) {
      throw createServiceError("Invalid tags provided", 400);
    }
    return validation.validTags;
  }
}
