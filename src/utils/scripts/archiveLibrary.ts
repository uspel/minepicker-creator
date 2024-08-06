import { create, replace } from "tar";
import { readdirSync } from "fs";
import { join } from "path";

import { fileExists } from "../fs";
import message from "../message";
import Data from "../../data";
import prettyPath from "../prettyPath";

const licenseFileNames = ["COPYING", "LICENSE", "UNLICENSE"];

export default async function archiveLibrary(inputDir: string, scope: string) {
  const outputPath = join(inputDir, Data.scriptLibraryArchiveFileName);

  const entries = readdirSync(inputDir, { withFileTypes: true });

  const paths: string[] = [];

  for (const { name } of entries) {
    if (name === Data.scriptLibraryArchiveFileName) continue;

    paths.push(name);
  }

  message(`Archiving library from *${prettyPath(inputDir, "relative")}*...`, "update", scope);

  await create(
    {
      file: outputPath,
      cwd: inputDir,
    },
    paths
  );

  await replace(
    {
      file: outputPath,
      cwd: process.cwd(),
    },
    licenseFileNames.filter(fileExists)
  );

  message("Successfully created library archive!", "success", scope);
}
