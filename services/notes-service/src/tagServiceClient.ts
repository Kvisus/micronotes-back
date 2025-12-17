export interface TagValidationResponse {
  validTags: Array<{
    id: string;
    name: string;
    color?: string;
    userId: string;
    updatedAt: Date;
  }>;
  invalidTags: string[];
}

export class TagServiceClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.TAGS_SERVICE_URL || "http://localhost:3004";
  }
}
