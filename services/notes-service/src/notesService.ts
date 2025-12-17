import { createServiceError, sanitizeInput } from "../../../shared/utils";
import { CreateNoteRequest, Note } from "../../../shared/types";
import prisma from "./database";

export class NotesService {
  constructor() {}
  async createNote(
    userId: string,
    noteData: CreateNoteRequest,
    authToken?: string
  ): Promise<Note> {
    const sanitizedTitle = sanitizeInput(noteData.title);
    const sanitizedContent = sanitizeInput(noteData.content);

    const note = await prisma.note.create({
      data: {
        userId,
        title: sanitizedTitle,
        content: sanitizedContent,
      },
      include: {
        noteTags: true,
      },
    });
    // TODO add tags to note if provided

    return note as Note;
  }

  async getNoteById(noteId: string, userId: string): Promise<Note> {
    const note = await prisma.note.findFirst({
      where: {
        id: noteId,
        userId,
        isDeleted: false,
      },
      include: {
        noteTags: true,
      },
    });

    if (!note) {
      throw createServiceError("Note not found", 404);
    }
    
    return note;
  }
}
