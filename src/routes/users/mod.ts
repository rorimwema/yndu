// Users routes
import { OakRouter } from "../../deps.ts";

export const usersRouter = new OakRouter();

usersRouter.get("/me", (ctx) => {
  ctx.response.body = { user: null };
});

usersRouter.get("/:id", (ctx) => {
  ctx.response.body = { user: null };
});
