import { Router, Response, Request } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { servicesConfig } from "../config/services";
import dotenv from "dotenv";

const router = Router();

function createServiceProxy(
  targetUrl: string,
  partRewrite?: Record<string, string>
): any {
  const options = {
    target: targetUrl,
    changeOrigin: true,
    pathRewrite: partRewrite || {},
    timeout: 30000,
    proxyTimeout: 30000,
    onError: (err: any, req: Request, res: Response) => {
      console.error(`Proxy error for ${targetUrl}:`, err);
      if (!res.headersSent) {
        res.status(503).json({
          success: false,
          message: "Service unavailable",
          error: err.message,
        });
      }
    },
    onProxyReq: (proxyReq: any, req: any, res: any) => {
      // log proxy request for now
      console.log(
        `Proxying request to ${targetUrl} ${req.method} ${req.originalUrl}`
      );

      // forward user info if available
      if (req.user) {
        proxyReq.setHeader("x-user-id", req.user.userId);
        proxyReq.setHeader("x-user-email", req.user.email);
      }

      // ensure content type for POST/PUT requests
      if (
        req.body &&
        (req.method === "POST" ||
          req.method === "PUT" ||
          req.method === "PATCH")
      ) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader("Content-Type", "application/json");
        proxyReq.setHeader(
          "Content-Length",
          Buffer.byteLength(bodyData).toString()
        );
        proxyReq.write(bodyData);
      }
    },
    onProxyRes: (proxyRes: any, req: any) => {
      //log proxy response for now
      console.log(
        `Received response from ${targetUrl}: ${proxyRes.statusCode} for ${req.method} ${req.originalUrl}`
      );
    },
  };
  return createProxyMiddleware(options);
}

router.use(
  "/api/auth",
  createServiceProxy(servicesConfig.auth.url, {
    "^/api/auth": "/auth", //rewrite api/auth to auth
  })
);

router.use(
  "/api/user",
  createServiceProxy(servicesConfig.user.url, {
    "^/api/user": "/user", //rewrite api/user to user
  })
);

router.use(
  "/api/notes",
  createServiceProxy(servicesConfig.notes.url, {
    "^/api/notes": "/notes", //rewrite api/notes to notes
  })
);

export default router;
