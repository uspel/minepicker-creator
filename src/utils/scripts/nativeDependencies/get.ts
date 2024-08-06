import { basename, join } from "path";
import { realpathSync } from "fs";

import { getScriptLibraryConfig } from "../libraryConfig";

export default function getNativeDependencies(dependencies: Record<string, string>, librariesDir: string, actualVersions?: boolean) {
  const nativeDependencies: Record<string, string> = {};

  for (const dependency in dependencies) {
    const path = join(librariesDir, dependency);
    const config = getScriptLibraryConfig(path, dependency);
    if (!config?.native) continue;

    if (actualVersions) {
      const actualVersion = basename(realpathSync(path));
      nativeDependencies[dependency] = actualVersion;
    } else {
      nativeDependencies[dependency] = dependencies[dependency]!;
    }
  }

  return nativeDependencies;
}
