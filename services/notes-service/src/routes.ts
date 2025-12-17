import { Router } from "express";
import { createNote, getNoteById, getNotes } from "./notesController";
import { validateRequest, authenticateToken } from "../../../shared/middleware";
import { createNoteSchema, getNotesByUserSchema } from "./validation";

const router = Router();

router.use(authenticateToken);

router.post("/", validateRequest(createNoteSchema), createNote);
router.get("/:noteId", getNoteById);
router.get("/", validateRequest(getNotesByUserSchema), getNotes);

export default router;
