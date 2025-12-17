import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import proxyRoutes from "./routes/proxy";
import { gatewayAuth } from "./midlleware/auth";
import { createErrorResponse } from "../../shared/utils";

const app = express();
const PORT = process.env.PORT || 8080;

//trust proxy for reverse proxies
app.set("trust proxy", 1);

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: process.env.CORS_CREDENTIALS === "true",
    methods: "GET,PUT,PATCH,POST,DELETE,OPTIONS",
    allowedHeaders: "Content-Type,Authorization,x-user-id,x-user-email",
  })
);
app.use(helmet({ crossOriginEmbedderPolicy: false }));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(gatewayAuth);

app.use(proxyRoutes);

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  console.log("Unhandled error:", error);

  if (!res.headersSent) {
    res
      .status(error.statusCode || 500)
      .json(createErrorResponse(error.message || "Internal server error"));
  }
});

const server = app.listen(PORT, () => {
  console.log(`API Gateway is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log("Possible endpoints:");
  console.log("--------------------------------");
  console.log("| Path | URL |");
  console.log("--------------------------------");
  console.log(`| /auth | http://localhost:${PORT}//api/auth/* |`);
  console.log(`| /user | http://localhost:${PORT}//api/user/* |`);
  console.log(`| /notes | http://localhost:${PORT}//api/notes/* |`);
  console.log(`| /tags | http://localhost:${PORT}//api/tags/* |`);
  console.log("--------------------------------");
});

//gracful shutdown
process.on("SIGINT", () => {
  console.log("Shutting down API Gateway...");
  server.close(() => {
    console.log("API Gateway shut down gracefully");
    process.exit(0);
  });
});

process.on("SIGTERM", () => {
  console.log("Shutting down API Gateway...");
  server.close(() => {
    console.log("API Gateway shut down gracefully");
    process.exit(0);
  });
});

export default app;
