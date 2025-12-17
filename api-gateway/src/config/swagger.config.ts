import swaggerJsdoc from "swagger-jsdoc";
import path from "path";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Micronotes API",
      version: "1.0.0",
      description: "API Gateway для микросервисной архитектуры Micronotes",
      contact: {
        name: "API Support",
      },
    },
    servers: [
      {
        url: process.env.API_BASE_URL || "http://localhost:8080",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT токен авторизации. Формат: Bearer {token}",
        },
      },
    },
    tags: [
      {
        name: "Auth",
        description: "Эндпоинты для аутентификации и авторизации",
      },
      {
        name: "User",
        description: "Управление профилем пользователя",
      },
      {
        name: "Notes",
        description: "Управление заметками",
      },
      {
        name: "Tags",
        description: "Управление тегами",
      },
    ],
  },
  apis: [
    path.join(__dirname, "swagger.schemas.ts"), // схемы данных
    path.join(__dirname, "swagger.paths.ts"), // эндпоинты
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
