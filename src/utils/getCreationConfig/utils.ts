import semver from "semver";
import { join } from "path";

import getAbsolutePath from "../getAbsolutePath";
import { directoryExists } from "../fs";
import message from "../message";

export function convertDirectoriesToAbsolute(directories: Record<string, string>) {
  for (const dir in directories) {
    directories[dir] = getAbsolutePath(directories[dir]!);
  }
}

export function validScriptDependencies(dependencies: Record<string, string>, librariesDir: string) {
  let valid = true;

  for (const [libraryName, versionRange] of Object.entries(dependencies)) {
    if (!directoryExists(join(librariesDir, libraryName))) {
      message(`The library "${libraryName}" is not installed. Did you forget to run "minepicker use"?`, "failure");
      valid = false;
    }
    if (!semver.validRange(versionRange)) {
      message(`"${versionRange}" is not a valid version range for library "${libraryName}".`, "failure");
      valid = false;
    }
  }

  return valid;
}

export interface GetCreationConfigOptions {
  requireScripts?: boolean;
  validateScriptDependencies?: boolean;
}
