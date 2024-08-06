import { ScriptLibraryCreationConfig } from "../../../types/creation";
import rollupScripts from "../../../utils/scripts/rollup";

export default function devScriptLibrary({
  directories: { source: inputDir, development: outputDir },
  entries,
  bundle,
  minify,
  source_map: sourceMap,
  tree_shake: treeShake,
  dependencies,
}: ScriptLibraryCreationConfig) {
  rollupScripts(
    {
      inputDir,
      outputDir,
      entries,
      bundle,
      minify,
      sourceMap,
      treeShake,
      dependencies,
      resolveDependencies: false,
      emitDependenciesSymlink: true,
      emitLibraryConfig: true,
      watch: true,
    },
    "DEV"
  );
}
