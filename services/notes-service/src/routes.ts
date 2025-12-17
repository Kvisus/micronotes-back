import { Router } from "express";
import {
  createNote,
  getNoteById,
  getNotes,
  updateNote,
  deleteNote,
} from "./notesController";
import { validateRequest, authenticateToken } from "../../../shared/middleware";
import {
  createNoteSchema,
  updateNoteSchema,
  getNotesByUserSchema,
} from "./validation";

const router = Router();

router.use(authenticateToken);

router.post("/", validateRequest(createNoteSchema), createNote);
router.get("/", validateRequest(getNotesByUserSchema), getNotes);
router.get("/:noteId", getNoteById);
router.put("/:noteId", validateRequest(updateNoteSchema), updateNote);
router.patch("/:noteId", validateRequest(updateNoteSchema), updateNote);
router.delete("/:noteId", deleteNote);

export default router;
