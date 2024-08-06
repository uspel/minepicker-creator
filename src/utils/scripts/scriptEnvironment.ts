import { existsSync, mkdirSync, realpathSync, rmSync, symlinkSync, writeFileSync } from "fs";
import { join } from "path";

import { directoryExists } from "../fs";
import prettyPath from "../prettyPath";
import message from "../message";
import Data from "../../data";

export default function scriptEnvironment({ baseDir = process.cwd(), defaultTsconfig }: { baseDir?: string; defaultTsconfig: string }) {
  if (!existsSync(baseDir)) {
    mkdirSync(baseDir, { recursive: true });
  }

  // --------------------
  //       TSConfig
  // --------------------

  const tsconfigPath = join(baseDir, Data.scriptTsconfigFileName);

  if (!existsSync(tsconfigPath)) {
    writeFileSync(tsconfigPath, defaultTsconfig);
    message(`Created *${prettyPath(tsconfigPath, "relative")}*`, "addition");
  }

  // --------------------
  // Libraries Directory
  // --------------------

  const librariesDir = join(baseDir, Data.scriptLibrariesDirectoryName);

  if (!directoryExists(librariesDir)) {
    rmSync(librariesDir, { force: true });
    mkdirSync(librariesDir, { recursive: true });
  }

  // --------------------
  //     Engine Types
  // --------------------

  const engineTypesPath = join(librariesDir, Data.scriptEngineTypesFileName);

  let linkEngineTypes = false;

  if (!existsSync(engineTypesPath)) {
    linkEngineTypes = true;
  } else {
    const engineTypesRealpath = realpathSync(engineTypesPath);

    if (engineTypesRealpath !== Data.scriptEngineTypesFilePath) {
      rmSync(engineTypesPath, { recursive: true });

      linkEngineTypes = true;
    }
  }

  if (linkEngineTypes) symlinkSync(Data.scriptEngineTypesFilePath, engineTypesPath);
}
