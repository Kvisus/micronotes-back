import {
  createServiceError,
  isValidUUID,
  sanitizeInput,
} from "../../../shared/utils";
import { Tag, CreateTagRequest } from "../../../shared/types";
import prisma from "./database";

export class TagService {
  async createTag(userId: string, tagData: CreateTagRequest): Promise<Tag> {
    const sanitizedName = sanitizeInput(tagData.name);
    const sanitizedColor = tagData.color
      ? sanitizeInput(tagData.color)
      : undefined;

    if (sanitizedColor && !this.isValidHexColor(sanitizedColor)) {
      throw createServiceError(
        "Invalid color format, use hex format (e.g.,#572115 or #f73)",
        400
      );
    }

    try {
      const tag = await prisma.tag.create({
        data: {
          name: sanitizedName,
          color: sanitizedColor,
          userId,
        },
      });
      return tag as Tag;
    } catch (error) {
      if (error.code === "P2002") {
        throw createServiceError("Tag name already exists", 409);
      }

      throw createServiceError("Failed to create tag", 500);
    }
  }

  async getTagById(tagId: string, userId: string): Promise<Tag> {
    if (!isValidUUID(tagId)) {
      throw createServiceError("Invalid tag ID", 400);
    }

    const tag = await prisma.tag.findFirst({
      where: {
        id: tagId,
        userId,
      },
    });
    if (!tag) {
      throw createServiceError("Tag not found", 404);
    }
    return tag as Tag;
  }

  private isValidHexColor(color: string): boolean {
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return hexColorRegex.test(color);
  }

  async getTagsByUser(
    page: number = 1,
    limit: number = 50,
    userId?: string,
    search?: string
  ): Promise<{
    tags: Tag[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    // where clause
    const whereClause: any = {
      userId,
    };

    // add search filter if provided
    if (search) {
      const sanitizedSearch = sanitizeInput(search);
      whereClause.name = {
        contains: sanitizedSearch,
        mode: "insensitive",
      };
    }
    const [tags, total] = await Promise.all([
      prisma.tag.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: {
          name: "asc",
        },
      }),
      prisma.tag.count({
        where: whereClause,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);
    return {
      tags: tags as Tag[],
      total,
      page,
      totalPages,
    };
  }

  async validateTags(
    tagIds: string[],
    userId: string
  ): Promise<{ validTags: Tag[]; invalidTags: string[] }> {
    const validTags: Tag[] = [];
    const invalidTags: string[] = [];

    for (const tagId of tagIds) {
      if (!isValidUUID(tagId)) {
        invalidTags.push(tagId);
        continue;
      }

      try {
        const tag = await this.getTagById(tagId, userId);
        validTags.push(tag);
      } catch (error) {
        invalidTags.push(tagId);
      }
    }

    return { validTags, invalidTags };
  }
}
