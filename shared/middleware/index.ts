import { logError, ServiceError } from "../types";
import { createErrorResponse } from "../utils";
import { Request, Response, NextFunction } from "express";

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
  return (req: Request, res: Response, next: NextFunction) => {
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
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors,
      });
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
