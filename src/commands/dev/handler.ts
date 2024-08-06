import { watch } from "chokidar";

import getCreationConfig from "../../utils/getCreationConfig";
import message from "../../utils/message";
import Data from "../../data";

import devAddon from "./addon";
import devScriptLibrary from "./scriptLibrary";

export function handler() {
  const [config] = getCreationConfig();

  message("Watching for changes...\n");
  configChangeHandler();

  switch (config.type) {
    case "addon":
    case "editor_extension":
      devAddon(config);
      break;
    case "script_library":
      devScriptLibrary(config);
  }
}

function configChangeHandler() {
  watch(Data.creationConfigFilePath, {
    ignoreInitial: true,
    usePolling: true,
    interval: 500,
  }).on("all", () => {
    message(`Change detected in creation config file at *${Data.creationConfigFileName}*. Exiting development...`, "failure");

    process.exit(1);
  });
}
