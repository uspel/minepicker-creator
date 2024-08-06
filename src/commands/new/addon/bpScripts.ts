import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";

import scriptEnvironment from "../../../utils/scripts/scriptEnvironment";
import prettyPath from "../../../utils/prettyPath";
import message from "../../../utils/message";
import Data from "../../../data";

export default function scripts({ outputDir, entry }: { outputDir: string; entry: string }) {
  mkdirSync(outputDir, { recursive: true });
  message(`Created *${prettyPath(outputDir, "relative")}*`, "addition");

  // Create index file
  const indexPath = join(outputDir, entry);
  writeFileSync(indexPath, Data.defaultScript);

  message(`Created *${prettyPath(indexPath, "relative")}*`, "addition");

  scriptEnvironment({
    baseDir: outputDir,
    defaultTsconfig: Data.defaultBehaviorPackScriptsTsconfig,
  });
}
