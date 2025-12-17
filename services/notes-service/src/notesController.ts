import { createErrorResponse, createSuccessResponse } from "@shared/utils";
import { asyncHandler } from "../../../shared/middleware";
import { NotesService } from "./notesService";
import { Request, Response } from "express";

const notesService = new NotesService();

export const createNote = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    res.status(401).json(createErrorResponse("Unauthorized"));
    return;
  }

  const authHeader = req.headers.authorization;
  const authToken = authHeader && authHeader.split(" ")[1];

  if (!authToken) {
    res.status(401).json(createErrorResponse("Unauthorized"));
    return;
  }

  const note = await notesService.createNote(userId, req.body, authToken);
  res
    .status(201)
    .json(createSuccessResponse(note, "Note created successfully"));
});

export const getNoteById = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    res.status(401).json(createErrorResponse("Unauthorized"));
    return;
  }

  const noteId = req.params.noteId;
  const note = await notesService.getNoteById(noteId, userId);
  res
    .status(200)
    .json(createSuccessResponse(note, "Note retrieved successfully"));
});
