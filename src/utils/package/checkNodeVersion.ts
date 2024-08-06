import { satisfies } from "semver";
import chalk from "chalk";

import message from "../message";
import Data from "../../data";

if (!satisfies(process.version, Data.package.engines.node)) {
  message(`Minepicker requires NodeJS version ${Data.package.engines.node}:`, "failure");
  console.error(chalk.red(`  Your current NodeJS version is ${process.versions.node}`));

  process.exit(1);
}
