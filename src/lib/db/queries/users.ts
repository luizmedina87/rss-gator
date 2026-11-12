import { db } from "../index.js";
import { users } from "../schema.js";
import { eq, sql } from "drizzle-orm";

export async function createUser(name: string) {
  const [result] = await db.insert(users).values({ name: name }).returning();
  return result;
}

export async function getUser(name: string) {
  const [result] = await db.select().from(users).where(eq(users.name, name));
  return result || undefined;
}

export async function deleteUsers() {
  const [result] = await db.execute(sql`TRUNCATE TABLE users;`);
  return result;
}
