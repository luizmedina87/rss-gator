import { setUser } from "./config.js";

export function handlerLogin(cmdName: string, ...args: string[]) {
  // FIXME inputs from the system need dedicated validators
  if (args.length === 0) {
    console.error("Username is required");
    process.exit(1);
  }

  const userName = args[0];

  setUser(userName);
  console.log(`Username has been set to ${userName}`);
}
