import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./routes";
import { corsOptions, errorHandler, healthCheck } from "../../../shared/middleware";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors(corsOptions()));
app.use(helmet());

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/auth", authRoutes);

app.get("/health", healthCheck);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Auth service is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

export default app;
