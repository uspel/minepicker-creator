import { join } from "path";
import semver from "semver";
import chalk from "chalk";

import { getScriptLibraryConfig } from "../libraryConfig";
import { directoryExists } from "../../fs";
import message from "../../message";
import Data from "../../../data";

import getNativeDependencies from "./get";

export default function checkNativeDependencies(
  creationNativeDependencies: Record<string, string>,
  dependencies: Record<string, string>,
  librariesDirectory: string,
  parentName?: string
) {
  let allValid = true;

  const isSubDependency = !!parentName;
  if (!isSubDependency) message("Checking native script dependencies for incompatibilities...", "update");

  const nativeDependencies = getNativeDependencies(dependencies, librariesDirectory);

  for (const [dependencyName, dependencyVersionRange] of Object.entries(dependencies)) {
    const dependencyDirectory = join(librariesDirectory, dependencyName);

    if (isSubDependency && !directoryExists(dependencyDirectory)) {
      message("");
      message(`Library "${parentName}" is missing dependency "${dependencyName}".`, "failure");
      allValid = false;
      continue;
    }

    const isNative = dependencyName in nativeDependencies;

    if (isSubDependency && isNative) {
      const creationRequestedNativeVersion = creationNativeDependencies[dependencyName];

      if (creationRequestedNativeVersion) {
        const isRequestedVersionSubset = semver.subset(creationRequestedNativeVersion, dependencyVersionRange);
        if (isRequestedVersionSubset) continue;

        message("");
        message(
          `Dependency "${parentName}" requires native module "${dependencyName}" version ${dependencyVersionRange} ` +
            `but this creation requires "${dependencyName}" version ${creationRequestedNativeVersion}. ` +
            "This means that scripts may behave incorrectly.",
          "warning"
        );
        allValid = false;
      } else {
        const versionRangeArg = dependencyVersionRange.includes(" ") ? `"${dependencyVersionRange}"` : dependencyVersionRange;

        message("");
        message(
          `Dependency "${parentName}" requires native module "${dependencyName}" version ${dependencyVersionRange} but this creation is not using it.` +
            "\n  Run the following command to ensure that your dependencies function: " +
            chalk.reset.bold(`minepicker use ${dependencyName} ${versionRangeArg}`),
          "warning"
        );
        allValid = false;
      }
    }

    const dependencyConfig = getScriptLibraryConfig(dependencyDirectory, dependencyName);

    if (dependencyConfig === null) continue;

    const subAllValid = checkNativeDependencies(
      creationNativeDependencies,
      dependencyConfig.dependencies,
      join(dependencyDirectory, Data.scriptLibrariesDirectoryName),
      dependencyName
    );

    if (!subAllValid) allValid = false;
  }

  if (!isSubDependency) {
    if (allValid) message("All native script dependencies are compatible!\n", "success");
    else message("");
  }

  return allValid;
}
