import "dotenv/config";
import express from "express";
import serverless from "serverless-http";
import { registerRoutes } from "../../server/routes";

let handlerCache: any;

export const handler = async (event: any, context: any) => {
  if (!handlerCache) {
    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));

    // Basic request logging for API routes
    app.use((req, res, next) => {
      const start = Date.now();
      const path = req.path;
      let capturedJsonResponse: Record<string, any> | undefined = undefined;

      const originalResJson = res.json.bind(res);
      (res as any).json = function (bodyJson: any, ...args: any[]) {
        capturedJsonResponse = bodyJson;
        return originalResJson(bodyJson, ...args);
      };

      res.on("finish", () => {
        const duration = Date.now() - start;
        if (path.startsWith("/api")) {
          let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
          if (capturedJsonResponse) {
            try {
              logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
            } catch {}
          }
          if (logLine.length > 120) {
            logLine = logLine.slice(0, 119) + "…";
          }
          console.log(logLine);
        }
      });

      next();
    });

    await registerRoutes(app);

    handlerCache = serverless(app, {
      requestId: function () {
        return undefined;
      },
    });
  }

  return handlerCache(event, context);
};
