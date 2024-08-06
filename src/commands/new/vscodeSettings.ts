import { writeFileSync } from "fs";
import { join } from "path";

import prettyPath from "../../utils/prettyPath";
import message from "../../utils/message";
import Data from "../../data";

export default function (outputDir: string = process.cwd()) {
  const settingsFilePath = join(outputDir, ".vscode/settings.json");
  writeFileSync(settingsFilePath, Data.defaultCreationVscodeSettings);

  message(`Created *${prettyPath(settingsFilePath, "relative")}*`, "addition");
}
