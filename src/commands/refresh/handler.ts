import { join, basename } from "path";
import { realpathSync } from "fs";

import getCreationConfig from "../../utils/getCreationConfig";
import message from "../../utils/message";
import Data from "../../data";

import { getNativeScriptDependencies } from "../../utils/scripts/nativeDependencies";
import installScriptLibrary from "../../utils/scripts/installLibrary";
import getLibraryConfig from "../../utils/scripts/libraryConfig/get";

export async function handler() {
  const [config] = getCreationConfig({
    requireScripts: true,
    validateScriptDependencies: false,
  });

  let dependencies: Record<string, string>;
  let librariesDirectory: string;

  switch (config.type) {
    case "addon":
    case "editor_extension":
      dependencies = config.behavior_pack!.scripts!.dependencies;
      librariesDirectory = join(config.behavior_pack!.directories.source, "scripts", Data.scriptLibrariesDirectoryName);
      break;
    case "script_library":
      dependencies = config.dependencies;
      librariesDirectory = join(process.cwd(), Data.scriptLibrariesDirectoryName);
      break;
    default:
      return;
  }

  const nativeDependencies = getNativeScriptDependencies(dependencies, librariesDirectory);

  for (const libraryName in nativeDependencies) {
    const libraryDirectory = join(librariesDirectory, libraryName);
    const libraryCacheDirectory = realpathSync(libraryDirectory);

    const libraryConfig = getLibraryConfig(libraryCacheDirectory, libraryName);
    if (!libraryConfig?.prerelease) continue;

    const libraryVersion = basename(libraryCacheDirectory);

    const installed = await installScriptLibrary({
      libraryName,
      libraryVersion,
      librariesDirectory,
      target: config.target,
      refresh: true,
    });

    if (!installed) {
      message(`Failed to refresh native module "${libraryName}".`, "failure");
      continue;
    }

    const preReleaseType = libraryVersion.endsWith("-beta") ? "beta" : "release candidate";

    message(`Refreshed the type definitions for native module "${libraryName}" ${preReleaseType} version ${libraryVersion}!`, "success");
  }
}
