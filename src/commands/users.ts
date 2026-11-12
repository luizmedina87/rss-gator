import { setUser } from "../config.js";
import { createUser, getUser } from "../lib/db/queries/users.js";

export async function handlerLogin(cmdName: string, ...args: string[]) {
  if (args.length !== 1) {
    throw new Error(`usage: ${cmdName} <name>`);
  }

  const username = args[0];
  const usernameData = await getUser(username);

  if (usernameData === undefined) {
    throw new Error(`Username '${username}' does not exist in the db`);
  }

  setUser(username);
  console.log(`Username has been set to ${username}`);
}

export async function handlerRegister(cmdName: string, ...args: string[]) {
  if (args.length !== 1) {
    throw new Error(`usage: ${cmdName} <name>`);
  }

  const username = args[0];
  console.log(`username is ${username}`);

  await createUser(username);

  setUser(username);
}
