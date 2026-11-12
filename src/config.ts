import os from "node:os";
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert";

type Config = {
  dbUrl: string;
  currentUserName: string;
};

export function setUser(userName: string): void {
  const config = readConfig();
  config.currentUserName = userName;
  writeConfig(config);
}

export function getCurrentUser(): string {
  return readConfig().currentUserName;
}

export function readConfig(): Config {
  let configFileText;

  try {
    configFileText = fs.readFileSync(getConfigFilePath(), "utf-8");
  } catch (error) {
    throw new Error(
      `Failed to read configuration data from disk: ${(error as Error).message}`,
    );
  }

  const configFileJSON = JSON.parse(configFileText);
  return validateConfig(configFileJSON);
}

function getConfigFilePath(): string {
  return path.join(os.homedir(), ".gatorconfig.json");
}

function writeConfig(config: Config): void {
  const rawConfig = {
    db_url: config.dbUrl,
    current_user_name: config.currentUserName,
  };
  const configText = JSON.stringify(rawConfig, null, 2);

  try {
    fs.writeFileSync(getConfigFilePath(), configText);
  } catch (error) {
    throw new Error(
      `Failed to save configuration data to disk: ${(error as Error).message}`,
    );
  }
}

function validateConfig(rawConfig: any): Config {
  assert(
    rawConfig && typeof rawConfig === "object",
    "rawConfig must be an object",
  );
  assert(
    Object.values(rawConfig).every((v) => typeof v === "string"),
    "values must be strings",
  );
  assert(
    "db_url" in rawConfig && "current_user_name" in rawConfig,
    "missing keys in rawConfig",
  );

  return {
    dbUrl: rawConfig.db_url,
    currentUserName: rawConfig.current_user_name,
  };
}
