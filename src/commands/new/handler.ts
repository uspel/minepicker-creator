import { fileExists } from "../../utils/fs";
import message from "../../utils/message";
import Data from "../../data";

import addon from "./addon";
import scriptLibrary from "./scriptLibrary";
import { select } from "@inquirer/prompts";
import { CreationConfig } from "../../types/creation";

function alreadyInitialised() {
  message("A creation has already been set up in the current directory.", "failure");
  process.exitCode = 1;
}

export async function handler() {
  if (fileExists(Data.creationConfigFilePath)) {
    alreadyInitialised();
    return;
  }

  const type = await select({
    message: "Which type of creation are you making?",
    choices: [
      { name: "Add-On", value: "addon" },
      { name: "Editor Extension", value: "editor_extension" },
      { name: "Script Library", value: "script_library" },
    ],
  });

  switch (type) {
    case "addon":
    case "editor_extension":
      await addon({ isEditorExtension: type === "editor_extension" });
      break;
    case "script_library":
      await scriptLibrary();
  }
}
