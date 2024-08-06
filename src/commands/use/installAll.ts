import { getNativeScriptDependencies, checkNativeScriptDependencies } from "../../utils/scripts/nativeDependencies";
import modifyAddonManifestScriptDependencies from "../../utils/scripts/packManifest/modifyScriptDependencies";
import installScriptLibrary from "../../utils/scripts/installLibrary";
import { CreationConfig } from "../../types/creation";
import message from "../../utils/message";

export default async function installAll({
  config,
  dependencies,
  librariesDirectory,
}: {
  config: CreationConfig;
  dependencies: Record<string, string>;
  librariesDirectory: string;
}) {
  const dependencyEntries = Object.entries(dependencies);
  const dependencyAmount = dependencyEntries.length;

  if (dependencyAmount === 0) {
    message("This creation has no dependencies to install.", "failure");
    process.exitCode = 1;
    return;
  }

  let hasNativeModules = false;

  for (const [libraryName, libraryVersion] of dependencyEntries) {
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

    if (installed.isNative) hasNativeModules = true;

    message(`You can now use "${libraryName}"!`, "success");
    message("");
  }

  switch (config.type) {
    case "addon":
    case "editor_extension":
      if (!hasNativeModules) break;

      await modifyAddonManifestScriptDependencies(
        config.behavior_pack!.directories.source,
        getNativeScriptDependencies(dependencies, librariesDirectory, true)
      );

      break;
    default:
  }

  const nativeDependencies = getNativeScriptDependencies(dependencies, librariesDirectory);
  checkNativeScriptDependencies(nativeDependencies, dependencies, librariesDirectory);

  if (dependencyAmount === 1) message("1 dependency was installed successfully!", "success");
  else message(`${dependencyAmount} dependencies were installed successfully!`, "success");
}
