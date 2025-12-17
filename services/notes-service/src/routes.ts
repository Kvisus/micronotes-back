import { Router } from "express";
import { createNote, getNoteById } from "./notesController";
import { validateRequest, authenticateToken } from "../../../shared/middleware";
import { createNoteSchema } from "./validation";

const router = Router();

router.use(authenticateToken);

router.post("/", validateRequest(createNoteSchema), createNote);
router.get("/:noteId", getNoteById);

export default router;
