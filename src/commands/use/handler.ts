import { join } from "path";

import getCreationConfig from "../../utils/getCreationConfig";
import message from "../../utils/message";
import Data from "../../data";

import installAll from "./installAll";
import installOne from "./installOne";

export async function handler(args: { libraryName?: string; versionRange?: string }) {
  const { libraryName, versionRange: libraryVersion } = args;

  const [config, originalConfig] = getCreationConfig({
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

  if (libraryName)
    await installOne({
      config,
      originalConfig,
      dependencies,
      libraryName,
      libraryVersion,
      librariesDirectory,
    });
  else
    await installAll({
      config,
      dependencies,
      librariesDirectory,
    });
}
