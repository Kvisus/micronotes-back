import { Router } from "express";
import { createTag, getTags, getTagById, validateTags } from "./tagController";
import { authenticateToken, validateRequest } from "../../../shared/middleware";
import {
  createTagSchema,
  getTagsByUserSchema,
  tagIdParamSchema,
  validateTagsSchema,
} from "./validation";

const router = Router();

router.use(authenticateToken);

router.post("/", validateRequest(createTagSchema), createTag);
router.get("/", getTags);
router.post("/:tagId", validateRequest(validateTagsSchema), validateTags);

export default router;
