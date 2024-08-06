import { writeFileSync } from "fs";
import { join } from "path";

import prettifyJson from "../../../utils/prettifyJson";
import { AddonCreationConfig, CreationTarget } from "../../../types/creation";
import prettyPath from "../../../utils/prettyPath";
import message from "../../../utils/message";
import Data from "../../../data";
import { BP, RP } from ".";

export default async function ({
  target,
  outputDir,
  rp,
  bp,
  isEditorExtension,
}: {
  target: CreationTarget;
  outputDir: string;
  rp?: RP;
  bp?: BP;
  isEditorExtension?: boolean;
}) {
  function directories(pack: RP | BP, buildDir: string) {
    const devPathPrefix = target === "stable" ? "minecraft:" : "minecraft-preview:";

    return {
      source: pack?.sourceDir,
      build: prettyPath(join("build", buildDir)),
      development: prettyPath(join(devPathPrefix, pack.devDir)),
    };
  }

  const config: AddonCreationConfig = {
    type: isEditorExtension ? "editor_extension" : "addon",
    target,
    behavior_pack: bp
      ? {
          directories: directories(bp, "BP"),
          generate_contents: true,
          scripts: bp.scripts
            ? {
                entry: bp.scripts.entry,
                bundle: true,
                dependencies: {},
              }
            : undefined,
        }
      : undefined,
    resource_pack: rp
      ? {
          directories: directories(rp, "RP"),
          generate_contents: true,
          textures: {
            generate_list: true,
          },
        }
      : undefined,
  };

  const prettifiedString = await prettifyJson(config, 70);

  const path = join(outputDir, Data.creationConfigFileName);
  writeFileSync(path, prettifiedString);

  message(`Created *${prettyPath(path, "relative")}*`, "addition");
}
