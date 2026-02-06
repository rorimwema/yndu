// Example test for Deno
import { assertEquals } from "../deps.ts";
import { Money } from "../../src/domain/value-objects/branded.ts";

Deno.test("Money.fromCents should create money from cents", () => {
  const money = Money.fromCents(5000);
  assertEquals(money.amount, 5000);
  assertEquals(money.currency, "KES");
});

Deno.test("Money.fromShillings should create money from shillings", () => {
  const money = Money.fromShillings(50);
  assertEquals(money.amount, 5000);
});

Deno.test("Money.add should add two money values", () => {
  const money1 = Money.fromShillings(50);
  const money2 = Money.fromShillings(30);
  const result = money1.add(money2);
  assertEquals(result.toShillings(), 80);
});

Deno.test("Money.toDisplay should format as KES", () => {
  const money = Money.fromShillings(1250);
  assertEquals(money.toDisplay(), "KES 1250.00");
});
