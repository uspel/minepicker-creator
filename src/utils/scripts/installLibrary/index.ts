import { symlinkSync, writeFileSync, rmSync, mkdirSync } from "fs";
import { SingleBar } from "cli-progress";
import { dirname, join } from "path";
import semver from "semver";
import chalk from "chalk";

import { ScriptLibraryConfig } from "../../../types/scriptLibrary";
import prettifyJson from "../../prettifyJson";
import { getScriptLibraryConfig } from "../libraryConfig";
import { CreationTarget } from "../../../types/creation";
import octokit from "../../../apis/octokit";
import { directoryExists } from "../../fs";
import message from "../../message";
import Data from "../../../data";

import getLibraryData from "./getLibraryData";
import extract from "./extract";

export default async function installScriptLibrary({
  libraryName,
  libraryVersion = "*",
  librariesDirectory,
  target,
  refresh,
}: {
  libraryName: string;
  libraryVersion?: string;
  librariesDirectory: string;
  target: CreationTarget;
  refresh?: boolean;
}): Promise<{ installedVersion: string; isNative: boolean } | null> {
  const libraryData = await getLibraryData(libraryName);
  if (libraryData === null) return null;

  const { repository, native } = libraryData;

  const [owner, repo] = repository.split("/") as [string, string];

  let availableReleasesData: Record<string, { isPrerelease: boolean; libraryArchiveUrl: string }> = {};

  try {
    const { data: releases } = await octokit.request("GET /repos/{owner}/{repo}/releases", {
      owner,
      repo,
    });

    for (const release of releases) {
      const validVersion = semver.valid(release.tag_name);
      if (!validVersion) continue;

      const archiveAsset = release.assets.find((asset) => asset.name === Data.scriptLibraryArchiveFileName || (native && asset.name === target));
      if (!archiveAsset) continue;

      availableReleasesData[validVersion] = {
        isPrerelease: release.prerelease,
        libraryArchiveUrl: archiveAsset.browser_download_url,
      };
    }
  } catch (e) {
    message(`Couldn't find repository "${repository}" for library "${libraryName}".`, "failure");
    return null;
  }

  const availableVersions = Object.keys(availableReleasesData);

  if (availableVersions.length === 0) {
    message(`Library "${libraryName}" has no releases so cannot be installed.`, "failure");
    return null;
  }

  const matchedVersion = semver.valid(semver.maxSatisfying(availableVersions, libraryVersion));

  if (!matchedVersion) {
    let msg = `Release with tag matching version range "${libraryVersion}" could not be found for library "${libraryName}".\n  `;

    if (native) {
      msg += `Available versions for Minecraft ${target === "stable" ? "(stable)" : "Preview"}: ${availableVersions.join(", ")}`;
    } else {
      msg += `Available versions: ${availableVersions.join(", ")}`;
    }

    message(msg, "failure");
    return null;
  }

  message(`Installing "${libraryName}" version *${matchedVersion}*...`, "update");

  const progressBar = new SingleBar({
    format: chalk.blue("  {bar} {percentage}% | {stage}"),
    barCompleteChar: "█",
    barIncompleteChar: "░",
    barsize: 20,
  });

  const { isPrerelease, libraryArchiveUrl } = availableReleasesData[matchedVersion]!;

  const libraryCacheDirectory = join(Data.scriptLibrariesCacheDirectoryPath, libraryName, matchedVersion);
  const isAlreadyInstalled = directoryExists(libraryCacheDirectory);

  // --------------------
  //  Download & extract
  // --------------------
  if (refresh || !isAlreadyInstalled) {
    try {
      rmSync(libraryCacheDirectory, { force: true, recursive: true });
      mkdirSync(libraryCacheDirectory, { recursive: true });

      // Extract library package
      await extract(libraryCacheDirectory, libraryArchiveUrl, progressBar);

      progressBar.setTotal(0);
      progressBar.update(0, {
        stage: "Done!",
      });
      progressBar.stop();

      // Get library config - if non-existant or invalid, fail the installation
      const libraryConfig = getScriptLibraryConfig(libraryCacheDirectory, libraryName);
      if (libraryConfig === null) return null;

      if (native) libraryConfig.native = true;
      else libraryConfig.native = undefined;

      if (isPrerelease) libraryConfig.prerelease = true;
      else libraryConfig.prerelease = undefined;

      writeFileSync(join(libraryCacheDirectory, Data.scriptLibraryConfigFileName), await prettifyJson(libraryConfig));

      // Install dependencies
      await dependencies(libraryConfig);
    } catch (e) {
      if (e instanceof Error) message(`${e.name}: ${e.message}${e.stack}`, "failure");
      else if (typeof e === "string") message(e, "failure");

      return null;
    }
  } else {
    progressBar.start(0, 0, {
      stage: "Done!",
    });
    progressBar.stop();
  }

  // --------------------
  // 'node_modules/???' symlink
  // --------------------
  if (!refresh) {
    const libraryPath = join(librariesDirectory, libraryName);

    // Remove symlink if it already exists (installing a new version of the library)
    rmSync(libraryPath, { force: true, recursive: true });

    mkdirSync(dirname(libraryPath), { recursive: true });
    symlinkSync(libraryCacheDirectory, libraryPath);
  }

  // --------------------
  //   Return installed
  // --------------------
  return { installedVersion: matchedVersion, isNative: native };

  // --------------------
  // Handle dependencies
  // --------------------
  async function dependencies(libraryConfig: ScriptLibraryConfig) {
    const dependencyEntries = Object.entries(libraryConfig.dependencies);

    if (dependencyEntries.length) message(`Installing "${libraryName}" dependencies...`, "update");

    for (const [dependencyName, dependencyVersion] of dependencyEntries) {
      const installed = await installScriptLibrary({
        libraryName: dependencyName,
        libraryVersion: dependencyVersion,
        librariesDirectory: join(libraryCacheDirectory, Data.scriptLibrariesDirectoryName), // Create in "node_modules" to satisfy TS
        target,
      });

      if (installed) continue;

      rmSync(libraryCacheDirectory, { recursive: true, force: true });
      throw undefined;
    }
  }
}
