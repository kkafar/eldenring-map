import { foreignKey, int, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

const foreignKeyCascadeActions = {
  onDelete: 'cascade',
  onUpdate: 'cascade',
} as const;

export const usersTable = sqliteTable("users", {
  name: text().primaryKey(),
});

export const profilesTable = sqliteTable("profiles", {
  profileName: text('profile_name').notNull(),
  userName: text('user_name').notNull().references(() => usersTable.name, foreignKeyCascadeActions)
}, (table) => {
  return [
    primaryKey({ columns: [table.profileName, table.userName] }),
  ]
});

export const markersTable = sqliteTable("marker_visited", {
  markerId: int('marker_id').notNull(),
  userName: text('user_name').notNull(),
  profileName: text('profile_name').notNull(),
}, (table) => {
  return [
    primaryKey({ columns: [table.userName, table.profileName, table.markerId] }),
    foreignKey({
      columns: [table.profileName, table.userName],
      foreignColumns: [profilesTable.profileName, profilesTable.userName],
    })
      .onDelete('cascade')
      .onUpdate('cascade'),
  ]
});

export type UsersTableRow = typeof usersTable.$inferSelect;
export type ProfilesTableRow = typeof profilesTable.$inferSelect;
export type MarkersTableRow = typeof markersTable.$inferSelect;

