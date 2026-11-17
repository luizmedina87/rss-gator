// import { setUser, readConfig } from "./config.js";
import { handlerAgg } from "./commands/aggregate.js";
import { handlerFeeds, handlerAddfeed } from "./commands/feeds.js";
import { handlerFollow, handlerFollowing } from "./commands/feed-follows.js";
import {
  runCommand,
  registerCommand,
  middlewareLoggedIn,
} from "./commands/commands.js";
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
  registerCommand(commandRegistry, "feeds", handlerFeeds);
  registerCommand(
    commandRegistry,
    "addfeed",
    await middlewareLoggedIn(handlerAddfeed),
  );
  registerCommand(
    commandRegistry,
    "follow",
    await middlewareLoggedIn(handlerFollow),
  );
  registerCommand(
    commandRegistry,
    "following",
    await middlewareLoggedIn(handlerFollowing),
  );

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
