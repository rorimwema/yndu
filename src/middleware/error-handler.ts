// Error handler middleware
import type { Context, Middleware } from "../deps.ts";

class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = "INTERNAL_ERROR",
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const errorHandler: Middleware = async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    console.error("Error:", error);

    if (error instanceof AppError) {
      ctx.response.status = error.statusCode;
      ctx.response.body = {
        error: error.message,
        code: error.code,
      };
    } else {
      ctx.response.status = 500;
      ctx.response.body = {
        error: "Internal Server Error",
        code: "INTERNAL_ERROR",
      };
    }
  }
};

export { AppError };
