import { setUser, getCurrentUser } from "../config.js";
import { createUser, getUser, getUsers } from "../lib/db/queries/users.js";

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

  await createUser(username);

  setUser(username);
  console.log(`Username ${username} created`);
  console.log(`Username has been set to ${username}`);
}

export async function handlerUsers(cmdName: string) {
  const users = await getUsers(cmdName);
  const currentUser = getCurrentUser();
  const userList = users
    .map(entry => entry.name)
    .sort()
    .map(name =>
      name === currentUser
        ? `* ${name} (current)`
        : `* ${name}`,
    )
    .join("\n");
  console.log(userList || "There are currently no users registered");
}
