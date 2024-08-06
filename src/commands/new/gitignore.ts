import { writeFileSync } from "fs";
import { join } from "path";

import prettyPath from "../../utils/prettyPath";
import message from "../../utils/message";
import Data from "../../data";

export default function (outputDir: string = process.cwd()) {
  const outputFile = join(outputDir, ".gitignore");

  writeFileSync(outputFile, Data.defaultCreationGitignore);

  message(`Created *${prettyPath(outputFile, "relative")}*`, "addition");
}
