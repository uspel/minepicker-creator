import { writeFileSync } from "fs";

import { CreationTarget, ScriptLibraryCreationConfig } from "../../../types/creation";
import prettifyJson from "../../../utils/prettifyJson";
import message from "../../../utils/message";
import Data from "../../../data";

export default async function ({ sourceDir, target, entry, devDir }: { sourceDir: string; target: CreationTarget; entry: string; devDir: string }) {
  const config: ScriptLibraryCreationConfig = {
    type: "script_library",
    target,
    directories: {
      source: sourceDir,
      development: devDir,
      build: "build",
    },
    entries: [entry],
    bundle: true,
    dependencies: {},
  };

  await write(config);
}

async function write(creation: ScriptLibraryCreationConfig) {
  const prettifiedString = await prettifyJson(creation, 70);

  writeFileSync(Data.creationConfigFilePath, prettifiedString);

  message(`Created *${Data.creationConfigFileName}*`, "addition");
}
