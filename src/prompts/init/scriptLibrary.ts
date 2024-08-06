import { input, select } from "@inquirer/prompts";

import { CreationTarget } from "../../types/creation";

import validateInputtedPath from "../validateInputtedPath";
import selectLicense from "../selectLicense";

export default async function scriptLibraryInitPrompts() {
  const target = await select<CreationTarget>({
    message: `Which version of Minecraft will your script library target?`,
    choices: [
      { name: "Minecraft (stable)", value: "stable" },
      { name: "Minecraft Preview", value: "preview" },
    ],
  });

  const sourceDir = await input({
    message: "Source folder name:",
    default: "src",
    validate: (input) => validateInputtedPath(process.cwd(), input),
  });

  const language = await select<"javascript" | "typescript">({
    message: "Which scripting language will you use?",
    default: "javascript",
    choices: [
      { name: "JavaScript", value: "javascript" },
      { name: "TypeScript", value: "typescript" },
    ],
  });

  const license = await selectLicense();

  return {
    target,
    sourceDir,
    language,
    license,
  };
}
