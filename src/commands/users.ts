import { setUser } from "../config.js";
import { createUser, getUser, resetUsers } from "../lib/db/queries/users.js";

export async function handlerLogin(cmdName: string, ...args: string[]) {
  if (args.length !== 1) {
    console.error(`usage: ${cmdName} <name>`);
    process.exit(1);
  }

  const username = args[0];
  const usernameData = await getUser(username);

  if (usernameData === undefined) {
    console.error(`Username '${username}' does not exist in the db`);
    process.exit(1);
  }

  setUser(username);
  console.log(`Username has been set to ${username}`);
}

export async function handlerRegister(cmdName: string, ...args: string[]) {
  if (args.length !== 1) {
    console.error(`usage: ${cmdName} <name>`);
    process.exit(1);
  }

  const username = args[0];
  console.log(`username is ${username}`);

  try {
    await createUser(username);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Username already exists");
    } else {
      console.error("Error running command createUser");
    }
    process.exit(1);
  }

  setUser(username);
  process.exit(0);
}

export async function handlerReset(cmdName: string) {
  try {
    await resetUsers();
  } catch (error) {
    console.error("Error running command reset");
    process.exit(1);
  }
  process.exit(0);
}
