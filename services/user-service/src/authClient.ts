import { createServiceError } from "../../../shared/utils";
import { JwtPayload, ServiceResponse } from "../../../shared/types";
import axios from "axios";

export class AuthClient {
  private readonly authServiceUrl: string;

  constructor() {
    this.authServiceUrl =
      process.env.AUTH_SERVICE_URL || "http://localhost:3001";
  }

  async validateToken(token: string): Promise<JwtPayload> {
    try {
      const response = await axios.post<ServiceResponse<JwtPayload>>(
        `${this.authServiceUrl}/auth/validate`,
        {},
        { headers: { Authorization: `Bearer ${token}` }, timeout: 5000 }
      );

      if (!response.data.success || !response.data.data) {
        throw createServiceError("Invalid token from auth service", 401);
      }

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw createServiceError("Invalid or expired token", 401);
      }
      if (error.code === "ECONNREFUSED") {
        throw createServiceError("Failed to connect to auth service", 503);
      }
      throw createServiceError("An unexpected error occurred", 500);
    }
  }
}
