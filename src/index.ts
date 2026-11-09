import { setUser, readConfig } from "./config.js";

function main() {
  setUser("Luiz");
  console.log(readConfig());
}

main();
