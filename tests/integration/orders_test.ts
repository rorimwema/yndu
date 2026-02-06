// Integration test for orders API
import { assertEquals } from "../deps.ts";

const BASE_URL = "http://localhost:8000";

Deno.test("GET /health should return healthy status", async () => {
  const response = await fetch(`${BASE_URL}/health`);
  const data = await response.json();

  assertEquals(response.status, 200);
  assertEquals(data.status, "healthy");
});

Deno.test("GET /api/orders should return orders list", async () => {
  const response = await fetch(`${BASE_URL}/api/orders`);
  const data = await response.json();

  assertEquals(response.status, 200);
  assertEquals(typeof data.orders, "object");
});
