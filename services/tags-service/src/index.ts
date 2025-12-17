import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import {
  corsOptions,
  errorHandler,
  healthCheck,
} from "../../../shared/middleware";
import tagRoutes from "./routes";

const app = express();
const PORT = process.env.PORT || 3004;

app.use(cors(corsOptions()));
app.use(helmet());

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/tags", tagRoutes);
app.get("/health", healthCheck);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`User service is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

export default app;
