import { CompilerOptions } from "typescript";
import ts from "rollup-plugin-ts";
import { join } from "path";

import Data from "../../../data";

export default function typescript(baseDir: string) {
  const tsconfigPath = join(baseDir, Data.scriptTsconfigFileName);

  return ts({
    cwd: baseDir,
    tsconfig: {
      fileName: tsconfigPath,
      hook: linkTslib,
    },
  });
}

function linkTslib(options: CompilerOptions) {
  return {
    ...options,
    paths: {
      tslib: [Data.scriptTslibPath],
      ...options.paths,
    },
  };
}
