import { readFileSync } from "fs";
import { join } from "path";
import Ajv from "ajv";

import { ScriptLibraryConfig } from "../../../types/scriptLibrary";
import libraryConfigSchema from "../../../schemas/library.json";
import { fileExists } from "../../fs";
import message from "../../message";
import Data from "../../../data";

const configFile = Data.scriptLibraryConfigFileName;

// --------------------
//   Get library.json
// --------------------
export default function getLibraryConfig(libraryCacheDirectory: string, libraryName: string) {
  const libraryConfigPath = join(libraryCacheDirectory, configFile);

  if (!fileExists(libraryConfigPath)) {
    message(`Cannot find "${configFile}" file for library "${libraryName}". It is unknown which other libraries it depends on.`, "failure");
    return null;
  }

  let config: ScriptLibraryConfig;

  try {
    config = JSON.parse(readFileSync(libraryConfigPath, { encoding: "utf-8" }));
    const ajv = new Ajv();

    const validate = ajv.compile(libraryConfigSchema);
    const valid = validate(config);

    if (!valid) throw 0;
  } catch {
    message(`"${configFile}" file for "${libraryName}" is invalid. It is unknown which other libraries it depends on.`, "failure");
    return null;
  }

  return config;
}
