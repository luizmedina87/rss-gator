// import { setUser, readConfig } from "./config.js";
import { handlerLogin } from "./commands/commandLogin.js";
import { runCommand } from "./commands/commands.js";
import type { CommandsRegistry } from "./commands/commands.js";

function main() {
  const cmdReg: CommandsRegistry = {};
  cmdReg.login = handlerLogin;

  let rawArgs = process.argv.slice(2);
  let cmdName = rawArgs[0];
  let args = rawArgs.slice(1);

  if (!cmdName) {
    console.log("usage: cli <command> [args...]");
    process.exit(1);
  }

  try {
    runCommand(cmdReg, cmdName, ...args);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error running command ${cmdName}: ${error.message}`);
    } else {
      console.error(`Error running command ${cmdName}: ${error}`);
    }
    process.exit(1);
  }
}

main();
