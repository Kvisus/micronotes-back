process.env.NODE_ENV = "test";

// mock prisma
const mockPrismaClient = {
  note: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
    delete: jest.fn(),
    findFirst: jest.fn(),
  },
  noteTag: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
  },
  $disconnect: jest.fn(),
  $connect: jest.fn(),
};

// mock db module
jest.mock("../src/database", () => mockPrismaClient);

// mock test utils
global.mockPrisma = mockPrismaClient;

beforeEach(() => {
  jest.clearAllMocks();
});

export const testNote = {
  id: "test-note-id",
  userId: "test-user-id",
  title: "test-note-title",
  content: "test-note-content",
  isDeleted: false,
  createdAt: new Date("2025-01-01T00:00:00Z"),
  updatedAt: new Date("2025-01-01T00:00:00Z"),
  noteTags: [],
};

export const testCreateNoteRequest = {
  title: "new-test-note-title",
  content: "new-test-note-content",
  tagIds: ["test-tag-id-1", "test-tag-id-2"],
};

export const testUpdateNoteRequest = {
  title: "updated-test-note-title",
  content: "updated-test-note-content",
  tagIds: ["test-tag-id-3", "test-tag-id-4"],
};

export const testNoteTag = {
  noteId: "test-note-id",
  tagId: "test-tag-id-1",
};

//helper fn to reset mocks
export function resetAllMocks() {
  Object.values(mockPrismaClient.note).forEach((mock) => {
    if (jest.isMockFunction(mock)) {
      mock.mockReset();
    }
  });
  Object.values(mockPrismaClient.noteTag).forEach((mock) => {
    if (jest.isMockFunction(mock)) {
      mock.mockReset();
    }
  });
}

declare global {
  var mockPrisma: typeof mockPrismaClient;
}
