import { join } from "path";
import { writeFileSync } from "fs";

import { ScriptLibraryConfig } from "../../../types/scriptLibrary";
import prettifyJson from "../../prettifyJson";
import Data from "../../../data";

export default async function createScriptLibraryConfig(libraryDir: string, dependencies: Record<string, string>, scope?: string) {
  const configPath = join(libraryDir, Data.scriptLibraryConfigFileName);

  const config: ScriptLibraryConfig = {
    dependencies,
  };

  const configString = await prettifyJson(config);

  writeFileSync(configPath, configString);
}
