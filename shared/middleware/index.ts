import { JwtPayload, logError, ServiceError } from "../types";
import { createErrorResponse } from "../utils";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

//extend express request interface to include custom properties
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export function validateRequest(schema: any) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body);

    if (error) {
      const errors: Record<string, string[]> = {};
      error.details.forEach((detail: any) => {
        const field = detail.path.join(".");
        if (!errors[field]) {
          errors[field] = [];
        }
        errors[field].push(detail.message);
      });
      res.status(400).json({
        success: false,
        message: "Validation error",
        errors,
      });
      return;
    }
    next();
  };
}

export function errorHandler(
  err: ServiceError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  logError(err, {
    method: req.method,
    url: req.url,
    body: req.body,
    query: req.query,
    params: req.params,
  });

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";
  res.status(statusCode).json(createErrorResponse(message));

  next();
}

export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1]; //bearer
  if (!token) {
    res.status(401).json(createErrorResponse("Access token is required"));
    return;
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    logError(new Error("JWT_SECRET is not defined"));
    res.status(500).json(createErrorResponse("Internal server error"));
    return;
  }

  jwt.verify(token, jwtSecret, (err: any, decoded: any): void => {
    if (err) {
      res.status(403).json(createErrorResponse("Invalid token"));
      return;
    }
    req.user = decoded as JwtPayload; //attach decoded to request object
    next();
  });
}

export function corsOptions() {
  return {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: process.env.CORS_CREDENTIALS === "true",
    methods: "GET,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Content-Type,Authorization",
  };
}

export function healthCheck(req: Request, res: Response) {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
}
