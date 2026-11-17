// import { setUser, readConfig } from "./config.js";
import { handlerAgg, handlerFeeds, handlerAddfeed, handlerFollow, handlerFollowing } from "./commands/aggregate.js";
import { runCommand, registerCommand } from "./commands/commands.js";
import { handlerReset } from "./commands/reset.js";
import {
  handlerLogin,
  handlerUsers,
  handlerRegister,
} from "./commands/users.js";
import type { CommandsRegistry } from "./commands/commands.js";

async function main() {
  let rawArgs = process.argv.slice(2);
  let cmdName = rawArgs[0];
  let args = rawArgs.slice(1);

  if (!cmdName) {
    console.log("usage: cli <command> [args...]");
    process.exit(1);
  }

  const commandRegistry: CommandsRegistry = {};
  registerCommand(commandRegistry, "login", handlerLogin);
  registerCommand(commandRegistry, "register", handlerRegister);
  registerCommand(commandRegistry, "reset", handlerReset);
  registerCommand(commandRegistry, "users", handlerUsers);
  registerCommand(commandRegistry, "agg", handlerAgg);
  registerCommand(commandRegistry, "addfeed", handlerAddfeed);
  registerCommand(commandRegistry, "feeds", handlerFeeds);
  registerCommand(commandRegistry, "follow", handlerFollow);
  registerCommand(commandRegistry, "following", handlerFollowing);
  // 
  // Add a following command. It should print all the names 
  // of the feeds the current user is following.

  if (!(cmdName in commandRegistry)) {
    console.error(`command '${cmdName}' does not exist`);
    process.exit(1);
  }

  try {
    await runCommand(commandRegistry, cmdName, ...args);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error running command ${cmdName}: ${error.message}`);
    } else {
      console.error(`Error running command ${cmdName}: ${error}`);
    }
    process.exit(1);
  }
  process.exit(0);
}

main();
