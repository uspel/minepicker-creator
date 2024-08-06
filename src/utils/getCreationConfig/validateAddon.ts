import { join } from "path";

import { AddonCreationConfig } from "../../types/creation";
import { directoryExists } from "../fs";
import prettyPath from "../prettyPath";
import message from "../message";
import Data from "../../data";

import { convertDirectoriesToAbsolute, GetCreationConfigOptions, validScriptDependencies } from "./utils";
import scriptEnvironment from "../scripts/scriptEnvironment";

export default function validateAddonConfig(creation: AddonCreationConfig, options: GetCreationConfigOptions) {
  const { behavior_pack, resource_pack } = creation;
  const { requireScripts, validateScriptDependencies } = options;

  let valid = true;

  // --------------------
  //    Behavior Pack
  // --------------------

  if (behavior_pack) {
    convertDirectoriesToAbsolute(behavior_pack.directories);
    const sourceDir = behavior_pack.directories.source;

    if (!directoryExists(sourceDir)) {
      message(`Unable to resolve pack source directory at *${prettyPath(sourceDir, "relative")}*. Make sure that it exists and try again.`, "failure");

      valid = false;
    }
  }

  if (behavior_pack?.scripts) {
    const baseDir = join(behavior_pack.directories.source, "scripts");

    scriptEnvironment({
      baseDir,
      defaultTsconfig: Data.defaultBehaviorPackScriptsTsconfig,
    });

    if (validateScriptDependencies) {
      const librariesDir = join(baseDir, Data.scriptLibrariesDirectoryName);
      const validDependencies = validScriptDependencies(behavior_pack.scripts.dependencies, librariesDir);

      if (!validDependencies) valid = false;
    }
  } else {
    if (requireScripts) {
      message(
        `Scripts are not configured in this creation. Check your "${Data.creationConfigFileName}" file and make sure your behavior pack has a "scripts" field.`,
        "failure"
      );

      valid = false;
    }
  }

  // --------------------
  //    Resource Pack
  // --------------------

  if (resource_pack) {
    convertDirectoriesToAbsolute(resource_pack.directories);
    const sourceDir = resource_pack.directories.source;

    if (!directoryExists(sourceDir)) {
      valid = false;
      message(`Unable to resolve pack source directory at *${prettyPath(sourceDir, "relative")}*. Make sure that it exists and try again.`, "failure");
    }
  }

  if (!valid) process.exit(1);
}
