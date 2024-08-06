import { writeFileSync } from "fs";
import { join } from "path";

import { getLocalAppDataRelativeComMojangPath } from "../../../utils/getAbsolutePath";
import { CreationTarget } from "../../../types/creation";
import prettyPath from "../../../utils/prettyPath";
import message from "../../../utils/message";
import Data from "../../../data";

export default function vscodeLaunch({
  target,
  outputDir,
  bpDevDir,
  bpScriptsUuid,
}: {
  target: CreationTarget;
  outputDir: string;
  bpDevDir: string;
  bpScriptsUuid: string;
}) {
  const launchFilePath = join(outputDir, ".vscode/launch.json");

  const devScriptsDirPrefix = process.env.LOCALAPPDATA ? "%localappdata%" : "${workspaceFolder}";
  const devScriptsDir = prettyPath(join(devScriptsDirPrefix, getLocalAppDataRelativeComMojangPath(target, bpDevDir), "scripts"));

  writeFileSync(
    launchFilePath,
    `{
  "version": "0.3.0",
  "configurations": [
    {
      "name": "Debug with Minecraft",
      "type": "minecraft-js",
      "request": "attach",
      "mode": "listen",
      "port": ${Data.defaultBehaviorPackScriptDebuggerPort},
      "targetModuleUuid": "${bpScriptsUuid}",
      "sourceMapRoot": "${devScriptsDir}"
    }
  ]
}
`
  );

  message(`Created *${prettyPath(launchFilePath, "relative")}*`, "addition");
}
