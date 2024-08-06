import { rmSync, writeFileSync, readFileSync, existsSync } from "fs";
import { join } from "path";
import json5 from "json5";

import modifyAddonManifestScriptDependencies from "../../utils/scripts/packManifest/modifyScriptDependencies";
import { checkNativeScriptDependencies } from "../../utils/scripts/nativeDependencies";
import getNativeDependencies from "../../utils/scripts/nativeDependencies/get";
import getLibraryConfig from "../../utils/scripts/libraryConfig/get";
import prettifyJson from "../../utils/prettifyJson";
import getCreationConfig from "../../utils/getCreationConfig";
import { CreationConfig } from "../../types/creation";
import message from "../../utils/message";
import Data from "../../data";

export async function handler(args: { libraryName: string }) {
  const { libraryName } = args;

  const [config, originalConfig] = getCreationConfig({
    requireScripts: true,
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

  const libraryDirectory = join(librariesDirectory, libraryName);

  if (!existsSync(libraryDirectory)) {
    message(`Library "${libraryName}" is not an installed script dependency of this creation.`, "failure");
    process.exitCode = 1;
    return;
  }

  const { native } = getLibraryConfig(libraryDirectory, libraryName) ?? {};
  rmSync(libraryDirectory, { recursive: true, force: true });

  const newDependencies: Record<string, string> = {};

  for (const [depName, depVersion] of Object.entries(dependencies)) {
    if (libraryName === depName) continue;

    newDependencies[depName] = depVersion;
  }

  switch (originalConfig.type) {
    case "addon":
    case "editor_extension":
      originalConfig.behavior_pack!.scripts!.dependencies = newDependencies;

      if (!native) break;

      const nativeDependencies = getNativeDependencies(newDependencies, librariesDirectory, true);
      // @ts-ignore
      await modifyAddonManifestScriptDependencies(config.behavior_pack.directories.source, nativeDependencies);

      break;
    case "script_library":
      originalConfig.dependencies = newDependencies;
      break;
  }

  const prettifiedString = await prettifyJson(originalConfig);
  writeFileSync(Data.creationConfigFilePath, prettifiedString);

  message(`Removed library "${libraryName}" successfully.\n`, "deletion");

  const newNativeDependencies = getNativeDependencies(newDependencies, librariesDirectory);
  checkNativeScriptDependencies(newNativeDependencies, newDependencies, librariesDirectory);
}
