import { Router } from "express";
import {
  createTag,
  getTags,
  getTagById,
  validateTags,
  updateTag,
  deleteTag,
} from "./tagController";
import { authenticateToken, validateRequest } from "../../../shared/middleware";
import {
  createTagSchema,
  updateTagSchema,
  getTagsByUserSchema,
  tagIdParamSchema,
  validateTagsSchema,
} from "./validation";

const router = Router();

router.use(authenticateToken);

router.post("/", validateRequest(createTagSchema), createTag);
router.get("/", getTags);
router.post("/validate", validateRequest(validateTagsSchema), validateTags);
router.get("/:tagId", getTagById);
router.put("/:tagId", validateRequest(updateTagSchema), updateTag);
router.patch("/:tagId", validateRequest(updateTagSchema), updateTag);
router.delete("/:tagId", deleteTag);

export default router;
