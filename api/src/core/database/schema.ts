import { pgTable, uuid, varchar, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { Role } from '../../modules/user/domain/enums/role.enum';

export const userRoleEnum = pgEnum('user_role', [
  Role.ADMIN,
  Role.USER,
  Role.MODERATOR,
]);

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),

  name: varchar('name', { length: 255 }).notNull(),

  email: varchar('email', { length: 255 }).notNull().unique(),

  password: text('password').notNull(),

  phone: text('phone'),

  role: userRoleEnum('role').notNull().default(Role.USER),

  trialEndsAt: timestamp('trial_ends_at', { withTimezone: true }),

  createdAt: timestamp('created_at').defaultNow().notNull(),

  updatedAt: timestamp('updated_at').defaultNow().notNull(),

  deletedAt: timestamp('deleted_at'),
});
