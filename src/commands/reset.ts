import { deleteUsers } from "../lib/db/queries/users.js";

export async function handlerReset(_: string) {
  await deleteUsers();
  console.log("Table users was successfully reset");
}
