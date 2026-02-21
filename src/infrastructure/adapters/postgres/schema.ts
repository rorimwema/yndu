import { boolean, jsonb, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  phone: varchar('phone', { length: 20 }).notNull(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  phoneVerified: boolean('phone_verified').default(false).notNull(),
  profile: jsonb('profile').$type<Record<string, unknown>>().default({}),
  passwordHash: text('password_hash'),
  refreshToken: text('refresh_token'),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  addresses: jsonb('addresses').$type<
    Array<{
      id: string;
      street: string;
      city: string;
      county?: string;
      postalCode?: string;
      isDefault: boolean;
    }>
  >().default([]),
  name: varchar('name', { length: 255 }),
  role: varchar('role', { length: 50 }).default('B2C_CUSTOMER').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
