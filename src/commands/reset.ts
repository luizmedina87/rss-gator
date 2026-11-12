import { deleteUsers } from "../lib/db/queries/users.js";

export async function handlerReset(cmdName: string, ...args: string[]) {
  if (args.length > 0) {
    console.error(`usage: ${cmdName}`);
    process.exit(1);
  }

  await deleteUsers();
  console.log("Table users was successfully reset");
}
