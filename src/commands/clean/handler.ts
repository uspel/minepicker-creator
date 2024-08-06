import { rmSync } from "fs";

import getCreationConfig from "../../utils/getCreationConfig";
import message from "../../utils/message";

function remove(path: string) {
  rmSync(path, { force: true, recursive: true });
}

export function handler({ target }: { target?: "build" | "dev" }) {
  const [config] = getCreationConfig();

  const removeBuild = !target || target === "build";
  const removeDev = !target || target === "dev";

  switch (config.type) {
    case "addon":
    case "editor_extension":
      if (config.behavior_pack) {
        if (removeBuild) remove(config.behavior_pack.directories.build);
        if (removeDev) remove(config.behavior_pack.directories.development);
      }
      if (config.resource_pack) {
        if (removeBuild) remove(config.resource_pack.directories.build);
        if (removeDev) remove(config.resource_pack.directories.development);
      }
      break;
    case "script_library":
      if (removeBuild) remove(config.directories.build);
      if (removeDev) remove(config.directories.development);
      break;
    default:
  }

  const targetList = target ? `${target} directory` : "build and dev directories";

  message(`Deleted ${targetList} successfully.`, "deletion");
}
