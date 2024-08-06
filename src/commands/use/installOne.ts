import { writeFileSync } from "fs";
import semver from "semver";

import { getNativeScriptDependencies, checkNativeScriptDependencies } from "../../utils/scripts/nativeDependencies";
import modifyAddonManifestScriptDependencies from "../../utils/scripts/packManifest/modifyScriptDependencies";
import sortScriptDependencies from "../../utils/scripts/sortDependencies";
import installScriptLibrary from "../../utils/scripts/installLibrary";
import { CreationConfig } from "../../types/creation";
import prettifyJson from "../../utils/prettifyJson";
import message from "../../utils/message";
import Data from "../../data";

export default async function installOne({
  config,
  originalConfig,
  dependencies,
  libraryName,
  libraryVersion,
  librariesDirectory,
}: {
  config: CreationConfig;
  originalConfig: CreationConfig;
  dependencies: Record<string, string>;
  libraryName: string;
  libraryVersion?: string;
  librariesDirectory: string;
}) {
  const installed = await installScriptLibrary({
    libraryName,
    libraryVersion,
    librariesDirectory,
    target: config.target,
  });

  if (!installed) {
    process.exitCode = 1;
    return;
  }

  const { installedVersion, isNative } = installed;

  const newDependencies = sortScriptDependencies({
    ...dependencies,
    [libraryName]: !libraryVersion || semver.valid(libraryVersion) ? `^${installedVersion}` : libraryVersion,
  });

  switch (originalConfig.type) {
    case "addon":
    case "editor_extension":
      originalConfig.behavior_pack!.scripts!.dependencies = newDependencies;

      if (!isNative) break;

      const nativeDependencies = getNativeScriptDependencies(newDependencies, librariesDirectory, true);
      // @ts-ignore
      await modifyAddonManifestScriptDependencies(config.behavior_pack.directories.source, nativeDependencies);

      break;
    case "script_library":
      originalConfig.dependencies = newDependencies;
      break;
  }

  const prettifiedString = await prettifyJson(originalConfig);
  writeFileSync(Data.creationConfigFilePath, prettifiedString);

  message("");

  const newNativeDependencies = getNativeScriptDependencies(newDependencies, librariesDirectory);
  checkNativeScriptDependencies(newNativeDependencies, newDependencies, librariesDirectory);

  message(`You can now use "${libraryName}"!`, "success");
}
