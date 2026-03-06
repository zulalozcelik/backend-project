import { pgTable, uuid, varchar, text, timestamp, boolean, index } from 'drizzle-orm/pg-core';

export const tasks = pgTable(
  'tasks',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    title: varchar('title', { length: 200 }).notNull(),
    description: text('description'),
    isDone: boolean('is_done').notNull().default(false),

    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),

    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (t) => ({
    deletedAtIdx: index('tasks_deleted_at_idx').on(t.deletedAt),
  }),
);
