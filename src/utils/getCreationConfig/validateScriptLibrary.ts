import { join } from "path";

import { ScriptLibraryCreationConfig } from "../../types/creation";
import { directoryExists } from "../fs";
import prettyPath from "../prettyPath";
import message from "../message";
import Data from "../../data";

import { convertDirectoriesToAbsolute, GetCreationConfigOptions, validScriptDependencies } from "./utils";
import scriptEnvironment from "../scripts/scriptEnvironment";

export default function validateScriptLibraryConfig(creation: ScriptLibraryCreationConfig, options: GetCreationConfigOptions) {
  convertDirectoriesToAbsolute(creation.directories);

  const sourceDir = creation.directories.source;

  if (!directoryExists(sourceDir)) {
    message(`Unable to resolve scripts source directory at *${prettyPath(sourceDir, "relative")}*. Make sure that it exists and try again.`, "failure");
    process.exit(1);
  }

  if (!options.validateScriptDependencies) return;

  scriptEnvironment({
    defaultTsconfig: Data.defaultScriptLibraryTsconfig,
  });

  const librariesDir = join(process.cwd(), Data.scriptLibrariesDirectoryName);
  const validDependencies = validScriptDependencies(creation.dependencies, librariesDir);

  if (!validDependencies) process.exit(1);
}
