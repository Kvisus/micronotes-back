import { createServiceError, sanitizeInput } from "../../../shared/utils";
import {
  CreateNoteRequest,
  UpdateNoteRequest,
  Note,
} from "../../../shared/types";
import prisma from "./database";
import { TagServiceClient } from "./tagServiceClient";
import { Prisma } from "@prisma/client";

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

    // Use transaction to ensure atomicity
    const note = await prisma.$transaction(async (tx) => {
      const createdNote = await tx.note.create({
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
        await this.addTagsToNoteInTransaction(
          tx,
          createdNote.id,
          noteData.tagIds
        );
      }

      return createdNote;
    });

    // Refetch the note with tags if they were added
    if (noteData.tagIds && noteData.tagIds.length > 0) {
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

  private async addTagsToNoteInTransaction(
    tx: Prisma.TransactionClient,
    noteId: string,
    tagIds: string[]
  ): Promise<void> {
    const noteTagData = tagIds.map((tagId) => ({
      noteId,
      tagId,
    }));

    await tx.noteTag.createMany({
      data: noteTagData,
      skipDuplicates: true,
    });
  }

  async updateNote(
    noteId: string,
    userId: string,
    noteData: UpdateNoteRequest,
    authToken?: string
  ): Promise<Note> {
    const existingNote = await this.getNoteById(noteId, userId);
    if (!existingNote) {
      throw createServiceError("Note not found", 404);
    }
    return await prisma.$transaction(async (tx) => {
      const updateData: any = {};

      if (noteData.title !== undefined) {
        updateData.title = sanitizeInput(noteData.title);
      }

      if (noteData.content !== undefined) {
        updateData.content = sanitizeInput(noteData.content);
      }

      const note = await tx.note.update({
        where: { id: noteId },
        data: updateData,
        include: {
          noteTags: true,
        },
      });

      // Handle tag updates if provided
      if (noteData.tagIds !== undefined) {
        // Remove all existing tags
        await tx.noteTag.deleteMany({
          where: { noteId },
        });

        // Add new tags if provided
        if (noteData.tagIds.length > 0) {
          if (authToken) {
            await this.tagServiceClient.validateTags(
              noteData.tagIds,
              authToken
            );
          }
          await this.addTagsToNoteInTransaction(tx, noteId, noteData.tagIds);
        }
      }

      // Refetch to get updated note with tags
      return await this.getNoteById(noteId, userId);
    });
  }

  async deleteNote(noteId: string, userId: string): Promise<void> {
    const note = await this.getNoteById(noteId, userId);
    if (!note) {
      throw createServiceError("Note not found", 404);
    }
    await prisma.note.update({
      where: { id: noteId },
      data: { isDeleted: true },
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
