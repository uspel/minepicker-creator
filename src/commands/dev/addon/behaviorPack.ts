import { join } from "path";

import modifyPackManifestScriptEntry from "../../../utils/scripts/packManifest/modifyScriptEntry";
import generateContentsFile from "../../../utils/addon/generateContents";
import { BehaviorPackOptions } from "../../../types/creation";
import rollupScripts from "../../../utils/scripts/rollup";
import syncPack from "../../../utils/addon/syncPack";

export default async function devBehaviorPack({
  directories: { source: inputDir, development: outputDir },
  generate_contents: generateContents,
  scripts,
}: BehaviorPackOptions) {
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
      watch: true,
    },
    "DEV BP"
  );

  if (scripts) {
    const { entry, bundle, minify, source_map: sourceMap, tree_shake: treeShake, automatic_reload, dependencies } = scripts;

    rollupScripts(
      {
        inputDir: join(inputDir, "scripts"),
        outputDir: join(outputDir, "scripts"),
        baseDir: join(inputDir, "scripts"),
        entries: [entry],
        bundle,
        minify,
        sourceMap,
        treeShake,
        dependencies,
        websocket: automatic_reload ?? true,
        watch: true,
        onBuild() {
          if (generateContents) generateContentsFile(outputDir);
        },
      },
      "DEV BP"
    );
  }
}
