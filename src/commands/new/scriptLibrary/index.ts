import { mkdirSync, writeFileSync } from "fs";
import { join } from "path";

import scriptLibraryInitPrompts from "../../../prompts/init/scriptLibrary";

import scriptEnvironment from "../../../utils/scripts/scriptEnvironment";
import prettyPath from "../../../utils/prettyPath";
import message from "../../../utils/message";
import Data from "../../../data";

import example from "./example";

import vscodeDirectory from "../vscodeDirectory";
import vscodeSettings from "../vscodeSettings";

import gitignore from "../gitignore";
import licenseFile from "../license";
import creation from "./creation";

export default async function () {
  const { target, sourceDir, language, license } = await scriptLibraryInitPrompts();
  const entry = "index." + (language === "javascript" ? "js" : "ts");

  vscodeDirectory();
  vscodeSettings();

  // Create source directory
  const srcDir = join(process.cwd(), sourceDir);
  mkdirSync(srcDir, { recursive: true });

  message(`Created *${prettyPath(srcDir, "relative")}*`, "addition");

  // Create entry file
  const indexPath = join(srcDir, entry);
  writeFileSync(indexPath, Data.defaultScript);

  message(`Created *${prettyPath(indexPath, "relative")}*`, "addition");

  gitignore();

  if (license) licenseFile({ license });

  scriptEnvironment({
    defaultTsconfig: Data.defaultScriptLibraryTsconfig,
  });

  const { scriptsDir } = await example({
    target,
    license,
  });

  const devDir = scriptsDir ? prettyPath(join(scriptsDir, Data.scriptLibrariesDirectoryName, "test"), "relative") : "dev";

  await creation({
    target,
    entry,
    sourceDir,
    devDir,
  });
}
