import { confirm, input, select } from "@inquirer/prompts";
import { join } from "path";

import validateInputtedPath from "../../../prompts/validateInputtedPath";
import { CreationTarget } from "../../../types/creation";
import { License } from "../../../types/license";

import initAddon from "../addon";

export default async function initExample({ target, license }: { target: CreationTarget; license?: License }) {
  const init = await confirm({
    message: "Would you like to set up an example creation?",
    default: true,
  });

  if (!init) return {};

  const type = await select({
    message: "Which type of example creation would you like to make?",
    choices: [
      { name: "Add-On", value: "addon" },
      { name: "Editor Extension", value: "editor_extension" },
    ],
  });

  const dir = await input({
    message: "Example creation folder name:",
    default: "example",
    validate: (value) => validateInputtedPath(process.cwd(), value),
  });

  const outputDir = join(process.cwd(), dir);
  return await initAddon({
    outputDir,
    isEditorExtension: type === "editor_extension",
    scriptLibrary: {
      target,
      license,
    },
  });
}
