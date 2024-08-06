import { ResourcePackOptions } from "../../../types/creation";
import syncPack from "../../../utils/addon/syncPack";

export default function devResourcePack({
  directories: { source: inputDir, development: outputDir },
  generate_contents: generateContents,
  textures,
}: ResourcePackOptions) {
  syncPack(
    {
      inputDir,
      outputDir,
      generateContents,
      generateTexturesList: textures?.generate_list,
      watch: true,
    },
    "DEV RP"
  );
}
