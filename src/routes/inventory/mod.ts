// Inventory routes
import { OakRouter } from "../../deps.ts";

export const inventoryRouter = new OakRouter();

inventoryRouter.get("/", (ctx) => {
  ctx.response.body = { items: [] };
});

inventoryRouter.get("/:id", (ctx) => {
  ctx.response.body = { item: null };
});
