import { rmSync } from "fs";

import { ResourcePackOptions } from "../../../types/creation";
import syncPack from "../../../utils/addon/syncPack";

export default async function buildResourcePack({
  directories: { source: inputDir, build: outputDir },
  generate_contents: generateContents,
  textures,
}: ResourcePackOptions) {
  rmSync(outputDir, { force: true, recursive: true });

  syncPack(
    {
      inputDir,
      outputDir,
      generateContents,
      generateTexturesList: textures?.generate_list,
    },
    "BUILD RP"
  );
}
