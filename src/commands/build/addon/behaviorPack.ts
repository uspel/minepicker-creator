import { rmSync } from "fs";
import { join } from "path";

import modifyPackManifestScriptEntry from "../../../utils/scripts/packManifest/modifyScriptEntry";
import generateContentsFile from "../../../utils/addon/generateContents";
import { BehaviorPackOptions } from "../../../types/creation";
import rollupScripts from "../../../utils/scripts/rollup";
import syncPack from "../../../utils/addon/syncPack";

export default async function buildBehaviorPack({
  directories: { source: inputDir, build: outputDir },
  generate_contents: generateContents,
  scripts,
}: BehaviorPackOptions) {
  rmSync(outputDir, { force: true, recursive: true });

  if (scripts) {
    const { entry } = scripts;

    const outputEntry = entry.replace(/\.ts$/, ".js");
    await modifyPackManifestScriptEntry(inputDir, outputEntry);
  }

  syncPack(
    {
      inputDir,
      outputDir,
      generateContents,
      exclude: ["scripts"],
    },
    "BUILD BP"
  );

  if (scripts) {
    const { entry, bundle, minify, tree_shake: treeShake, dependencies } = scripts;

    rollupScripts(
      {
        baseDir: join(inputDir, "scripts"),
        inputDir: join(inputDir, "scripts"),
        outputDir: join(outputDir, "scripts"),
        entries: [entry],
        bundle,
        minify,
        sourceMap: false,
        treeShake,
        dependencies,
        onBuild() {
          if (generateContents) generateContentsFile(outputDir);
        },
      },
      "BUILD BP"
    );
  }
}
