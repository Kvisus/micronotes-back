import { ServiceError } from "../../../shared/types";
import { NotesService } from "../src/notesService";
import { resetAllMocks, testCreateNoteRequest, testNote } from "./setup";

// fn to test service error
async function expectServiceError(
  asyncFn: () => Promise<any>,
  errorMessage: string,
  statusCode: number
) {
  try {
    await asyncFn();
    fail("Expected service error but no error was thrown");
  } catch (error) {
    expect(error).toBeInstanceOf(ServiceError);
    const serviceError = error as ServiceError;
    expect(serviceError.message).toBe(errorMessage);
    expect(serviceError.statusCode).toBe(statusCode);
  }
}

describe("NotesService", () => {
  let notesService: NotesService;

  beforeEach(() => {
    resetAllMocks();
    notesService = new NotesService();
  });

  describe("createNote", () => {
    const userId = "test-user-id";

    it("should create a new note without tags", async () => {
      global.mockPrisma.note.create.mockResolvedValue(testNote);

      const result = await notesService.createNote(
        userId,
        testCreateNoteRequest
      );
      expect(global.mockPrisma.note.create).toHaveBeenCalledWith({
        data: {
          userId,
          title: testCreateNoteRequest.title,
          content: testCreateNoteRequest.content,
        },
        include: {
          noteTags: true,
        },
      });
      expect(result).toEqual(testNote);
    });
  });
  describe("getNoteById", () => {
    const userId = "test-user-id";
    const noteId = "test-note-id";

    it("should get a note by id", async () => {
      global.mockPrisma.note.findFirst.mockResolvedValue(testNote);

      const result = await notesService.getNoteById(noteId, userId);
      expect(global.mockPrisma.note.findFirst).toHaveBeenCalledWith({
        where: {
          id: noteId,
          userId,
          isDeleted: false,
        },
        include: {
          noteTags: true,
        },
      });
      expect(result).toEqual(testNote);
    });
  });
});
