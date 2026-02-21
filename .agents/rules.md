# Yndu Agent & Developer Rules

This document expands on `.cursorrules` to provide context and examples for working on the Yndu
codebase.

---

## 🛑 STRICT DON'TS

### 1. No `node_modules` in Backend

- **Don't** try to `npm install` packages for the backend `src/` directory.
- **Reason**: We use Deno. All dependencies are URL imports managed in `src/deps.ts`.

### 2. No Framework coupling in Domain

- **Don't** import `oak`, `Context`, `Router`, or `Request` inside `src/domain/`.
- **Reason**: The Domain layer must remain pure TypeScript. It should know nothing about HTTP or the
  Web. Use **Ports** (Interfaces) instead.
- **Bad**: `class Order { save(ctx: Context) { ... } }`
- **Good**: `class Order { save(repo: IOrderRepository) { ... } }`

### 3. No "Smart" UI Components

- **Don't** put business logic (calculating totals, validating rules) inside Vue components.
- **Reason**: Logic belongs in the Backend Domain or, if necessary, in a shared helper/composable.
  UI should only _display_ state.

### 4. No SQL in Controllers

- **Don't** write `db.query('SELECT * FROM ...')` inside a route handler.
- **Reason**: SQL belongs in `src/infrastructure/repositories`. Route handlers should call
  Application Service / Command Handlers only.

---

## ✅ REQUIRED DO'S

### 1. Use Zod for Everything

- **Do** validate every input at the system boundary (Route Handler).
- **Reason**: We trust nothing from the outside world. Zod guarantees our types are correct once
  they enter the system.

### 2. Event Sourcing First

- **Do** think "What _Event_ just happened?" (e.g., `OrderPlaced`) before thinking "What _State_
  changed?" (e.g., `status = 'PENDING'`).
- **Reason**: Our source of truth is the Event Stream.

### 3. Error Handling with monads

- **Do** use `Result.ok()` and `Result.fail()` instead of `throw new Error()`.
- **Reason**: It forces the caller to handle the error explicitly (no unhandled rejections).

### 4. Update the Docs

- **Do** update `core.md` if you make a significant architectural change.
- **Reason**: Documentation that lies is worse than no documentation.

---

## 5. GraphQL Governance

_(Adopted from ~/.agents/skills/graphql)_

### Schema First

- **Do** define your schema in `.graphql` files first.
- **Don't** auto-generate schemas from code (Code-First) unless explicitly approved.
- **Reason**: The Schema is the contract between Frontend and Backend (Federation).

### Federation Standards

- **Do** use `@key(fields: "id")` for all Entities.
- **Do** design schemas around the **Domain**, not the Database tables.
- **Don't** expose raw DB IDs or implementation details (e.g., `user_id_fk`).

### Resolvers are Dumb

- **Don't** put business logic in resolvers.
- **Do** have resolvers call the **Application Layer** (Command/Query Handlers).
- **Resolver Pattern**:
  ```typescript
  // GOOD
  resolve(parent, args, context) {
    return context.services.orderService.placeOrder(args.input);
  }
  ```

### N+1 Prevention

- **Do** use DataLoaders for all relationship fields (e.g., `Order.user`, `Order.items`).
- **Reason**: Performance. A list of 50 orders should not trigger 51 database queries.
