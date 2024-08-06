import Ajv, { ErrorObject } from "ajv";
import { readFileSync } from "fs";
import chalk from "chalk";
import json5 from "json5";

import { CreationConfig } from "../../types/creation";
import { fileExists } from "../fs";
import message from "../message";
import Data from "../../data";

import creationConfigSchema from "../../schemas/creation.json";

import validateScriptLibraryConfig from "./validateScriptLibrary";
import validateAddonConfig from "./validateAddon";

import { GetCreationConfigOptions } from "./utils";

export default function getCreationConfig(options: GetCreationConfigOptions = {}) {
  if (options.validateScriptDependencies === undefined) options.validateScriptDependencies = true;

  if (!fileExists(Data.creationConfigFilePath)) {
    message(`There isn't a creation set up in the current directory. Try using "minepicker new" first.`, "failure");
    process.exit(1);
  }

  message("Validating creation configuration...", "update");

  let config: CreationConfig;
  let originalConfig: CreationConfig;

  try {
    const data = readFileSync(Data.creationConfigFilePath, { encoding: "utf-8" });
    config = json5.parse(data);
    originalConfig = json5.parse(data);
  } catch (e) {
    console.error(chalk.red("The following error occurred when validating this creation's configuration file."));

    if (e instanceof Error) {
      console.error(chalk.hex("#bbbbbb")(`  ${e.name}: ${e.message}`));
      process.exit(1);
    } else throw e;
  }

  const validator = new Ajv({ allErrors: true });
  const validate = validator.compile(creationConfigSchema);

  validate(config);

  if (validate.errors) handleSchemaValidationErrors(validate.errors);

  switch (config.type) {
    case "addon":
    case "editor_extension":
      validateAddonConfig(config, options);
      break;
    case "script_library":
      validateScriptLibraryConfig(config, options);
  }

  message("Configuration validated successfully!\n", "success");

  return [config, originalConfig] as const;
}

function handleSchemaValidationErrors(errors: ErrorObject[]) {
  console.error(chalk.red(`Your config is invalid. See the following:`));
  for (const e of errors) {
    if (e.keyword === "oneOf") continue;

    const field = e.instancePath
      .substring(1)
      .replace(/\/([0-9]+)/g, "[$0]")
      .replace(/\/([0-9]+)\//g, "[$0].")
      .replace(/\//g, ".");

    let errorMessage = "  " + (field ? `Option "${chalk.white(field)}"` : "Config") + " " + e.message;

    switch (e.keyword) {
      case "enum":
        errorMessage += ": " + e.params.allowedValues.join(", ");
        break;
      case "additionalProperties":
        errorMessage += `; found "${e.params.additionalProperty}"`;
        break;
      default:
    }

    console.error(chalk.hex("#bbbbbb")(errorMessage));
  }
  process.exit(1);
}
