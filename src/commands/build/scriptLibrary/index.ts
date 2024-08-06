import { mkdirSync, rmSync } from "fs";

import { ScriptLibraryCreationConfig } from "../../../types/creation";
import rollupScripts from "../../../utils/scripts/rollup";
import message from "../../../utils/message";

export default async function buildScriptLibrary({
  directories: { source: inputDir, build: outputDir },
  entries,
  bundle,
  minify,
  tree_shake: treeShake,
  dependencies,
}: ScriptLibraryCreationConfig) {
  message("Building your script library...\n");

  rmSync(outputDir, { force: true, recursive: true });
  mkdirSync(outputDir);

  rollupScripts(
    {
      inputDir,
      outputDir,
      entries,
      bundle,
      minify,
      sourceMap: false,
      treeShake,
      dependencies,
      resolveDependencies: false,
      emitLibraryArchive: true,
      emitLibraryConfig: true,
    },
    "BUILD"
  );
}
