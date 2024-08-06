import getCreationConfig from "../../utils/getCreationConfig";

import buildAddon from "./addon";
import buildScriptLibrary from "./scriptLibrary";

export function handler() {
  const [config] = getCreationConfig();

  switch (config.type) {
    case "addon":
    case "editor_extension":
      buildAddon(config);
      break;
    case "script_library":
      buildScriptLibrary(config);
  }
}
