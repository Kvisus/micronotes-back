import { asyncHandler } from "../../../shared/middleware";
import { TagService } from "./tagService";
import { Request, Response } from "express";
import { createSuccessResponse } from "../../../shared/utils";
import { createErrorResponse } from "../../../shared/utils";
import { UpdateTagRequest } from "../../../shared/types";

const tagService = new TagService();

export const createTag = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    res.status(401).json(createErrorResponse("Unauthorized"));
    return;
  }

  const tag = await tagService.createTag(userId, req.body);
  res.status(201).json(createSuccessResponse(tag, "Tag created successfully"));
});

export const getTags = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    res.status(401).json(createErrorResponse("Unauthorized"));
    return;
  }

  const page = parseInt(req.query.page as string) || 1;
  const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
  const search = req.query.search as string;

  const tags = await tagService.getTagsByUser(page, limit, userId, search);
  res.status(200).json(
    createSuccessResponse(
      {
        tags: tags.tags,
        pagination: {
          page: tags.page,
          limit,
          total: tags.total,
          totalPages: tags.totalPages,
        },
      },
      "Tags retrieved successfully"
    )
  );
});

export const getTagById = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    res.status(401).json(createErrorResponse("Unauthorized"));
    return;
  }

  const tagId = req.params.tagId;
  const tag = await tagService.getTagById(tagId, userId);
  res
    .status(200)
    .json(createSuccessResponse(tag, "Tag retrieved successfully"));
});

export const validateTags = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json(createErrorResponse("Unauthorized"));
      return;
    }

    const tagIds = req.body.tagIds;
    const { validTags, invalidTags } = await tagService.validateTags(
      tagIds,
      userId
    );
    res
      .status(200)
      .json(
        createSuccessResponse(
          { validTags, invalidTags },
          "Tags validated successfully"
        )
      );
  }
);

export const updateTag = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    res.status(401).json(createErrorResponse("Unauthorized"));
    return;
  }

  const tagId = req.params.tagId;
  const tag = await tagService.updateTag(
    tagId,
    userId,
    req.body as UpdateTagRequest
  );
  res.status(200).json(createSuccessResponse(tag, "Tag updated successfully"));
});

export const deleteTag = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    res.status(401).json(createErrorResponse("Unauthorized"));
    return;
  }

  const tagId = req.params.tagId;
  await tagService.deleteTag(tagId, userId);
  res.status(200).json(createSuccessResponse(null, "Tag deleted successfully"));
});
