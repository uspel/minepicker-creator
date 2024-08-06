import { mkdirSync } from "fs";
import { join } from "path";

import prettyPath from "../../utils/prettyPath";
import message from "../../utils/message";

export default function (outputDir: string = process.cwd()) {
  const directoryPath = join(outputDir, ".vscode");
  mkdirSync(directoryPath, { recursive: true });

  message(`Created *${prettyPath(directoryPath, "relative")}*`, "addition");
}
