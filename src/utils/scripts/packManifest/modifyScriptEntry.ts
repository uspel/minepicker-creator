import { writeFileSync } from "fs";
import { join } from "path";
import { v4 } from "uuid";

import { PackManifestModule } from "../../../types/manifest";
import prettifyJson from "../../prettifyJson";
import Data from "../../../data";

import updateGeneratedWith from "./updateGeneratedWith";
import getPackManifest from "./get";

export default async function modifyAddonManifestScriptEntry(manifestDir: string, newScriptEntry: string) {
  const manifestPath = join(manifestDir, Data.packManifestFileName);

  const manifest = getPackManifest(manifestPath);
  if (!manifest) return;

  let scriptModule: PackManifestModule | undefined;

  if (manifest.modules && Array.isArray(manifest.modules)) {
    scriptModule = manifest.modules.find((module) => typeof module === "object" && module !== null && module.type === "script");
  } else {
    manifest.modules = [];
  }

  if (scriptModule) {
    if (scriptModule.entry === newScriptEntry) return;

    scriptModule.entry = newScriptEntry;
  } else {
    manifest.modules.push({
      type: "script",
      language: "javascript",
      entry: newScriptEntry,
      uuid: v4(),
      version: [1, 0, 0],
    });
  }

  updateGeneratedWith(manifest);

  const manifestString = await prettifyJson(manifest);

  writeFileSync(manifestPath, manifestString);
}
