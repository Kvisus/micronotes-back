import { createServiceError, sanitizeInput } from "../../../shared/utils";
import { CreateNoteRequest, Note } from "../../../shared/types";
import prisma from "./database";
import { TagServiceClient } from "./tagServiceClient";

export class NotesService {
  private tagServiceClient: TagServiceClient;

  constructor() {
    this.tagServiceClient = new TagServiceClient();
  }
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

    if (noteData.tagIds && noteData.tagIds.length > 0) {
      if (authToken) {
        await this.tagServiceClient.validateTags(noteData.tagIds, authToken);
      }
      await this.addTagsToNote(note.id, noteData.tagIds);

      //refetch the note with tags
      return await this.getNoteById(note.id, userId);
    }

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

  async getNotesByUser(
    userId: string,
    page: number = 1,
    limit: number = 50,
    search?: string
  ): Promise<{
    notes: Note[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const whereClause: any = {
      userId,
      isDeleted: false,
    };

    if (search) {
      const sanitizedSearch = sanitizeInput(search);
      whereClause.OR = [
        { title: { contains: sanitizedSearch, mode: "insensitive" } },
        { content: { contains: sanitizedSearch, mode: "insensitive" } },
      ];
    }

    const [notes, total] = await Promise.all([
      prisma.note.findMany({
        where: whereClause,
        include: { noteTags: true },
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.note.count({
        where: whereClause,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);
    return {
      notes: notes as Note[],
      total,
      page,
      totalPages,
    };
  }

  private async addTagsToNote(noteId: string, tagIds: string[]): Promise<void> {
    const noteTagData = tagIds.map((tagId) => ({
      noteId,
      tagId,
    }));

    await prisma.noteTag.createMany({
      data: noteTagData,
      skipDuplicates: true,
    });
  }

  async getNotesByTag(
    userId: string,
    tagId: string,
    page: number = 1,
    limit: number = 50,
    authToken?: string
  ): Promise<{
    notes: Note[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    if (authToken) {
      await this.tagServiceClient.validateTags([tagId], authToken);
    }

    const skip = (page - 1) * limit;

    const [notes, total] = await Promise.all([
      prisma.note.findMany({
        where: {
          userId,
          isDeleted: false,
          noteTags: {
            some: {
              tagId,
            },
          },
        },
        include: {
          noteTags: true,
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.note.count({
        where: {
          userId,
          isDeleted: false,
          noteTags: {
            some: {
              tagId,
            },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);
    return {
      notes: notes as Note[],
      total,
      page,
      totalPages,
    };
  }
}
