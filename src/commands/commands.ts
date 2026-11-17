import assert from "node:assert";
import { User } from "../lib/db/schema.js";
import { getCurrentUser } from "../config.js";
import { getUser } from "../lib/db/queries/users.js";

export type CommandHandler = (
  cmdName: string,
  ...args: string[]
) => Promise<void>;
export type CommandsRegistry = Record<string, CommandHandler>;

export type UserCommandHandler = (
  cmdName: string,
  user: User,
  ...args: string[]
) => Promise<void>;

export type middlewareLoggedIn = (
  handler: UserCommandHandler,
) => CommandHandler;

export async function middlewareLoggedIn(handler: UserCommandHandler): Promise<CommandHandler> {
  const useredHandler = async (cmdName: string, ...args: string[]) => {
    const currentUserName = getCurrentUser();
    if (!currentUserName)
      throw new Error(
        "Current user couldn't be retrieved. Check the configuration file.",
      );
    const userData = await getUser(currentUserName);
    return handler(cmdName, userData, ...args);
  }
  return useredHandler;
}

export function registerCommand(
  registry: CommandsRegistry,
  cmdName: string,
  handler: CommandHandler,
): void {
  registry[cmdName] = handler;
}

export async function runCommand(
  registry: CommandsRegistry,
  cmdName: string,
  ...args: string[]
): Promise<void> {
  assert(cmdName in registry, "command not found on registry");

  const handler = registry[cmdName];
  await handler(cmdName, ...args);
}
