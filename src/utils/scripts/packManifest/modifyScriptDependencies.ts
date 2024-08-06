import { writeFileSync } from "fs";
import { join } from "path";

import prettifyJson from "../../prettifyJson";
import Data from "../../../data";

import updateGeneratedWith from "./updateGeneratedWith";
import getPackManifest from "./get";

export default async function modifyAddonManifestScriptDependencies(manifestDir: string, nativeDependencies: Record<string, string>) {
  const manifestPath = join(manifestDir, Data.packManifestFileName);

  const manifest = getPackManifest(manifestPath);
  if (!manifest) return;

  if (manifest.dependencies && Array.isArray(manifest.dependencies)) {
    manifest.dependencies = manifest.dependencies.filter((dependency) => dependency && typeof dependency === "object" && !dependency.module_name);
  } else {
    manifest.dependencies = [];
  }

  const nativeDependencyEntries = Object.entries(nativeDependencies);

  for (const [module_name, version] of nativeDependencyEntries) {
    manifest.dependencies.push({
      module_name,
      version,
    });
  }

  updateGeneratedWith(manifest);

  const manifestString = await prettifyJson(manifest);

  writeFileSync(manifestPath, manifestString);
}
