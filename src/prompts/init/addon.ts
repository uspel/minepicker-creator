import { checkbox, confirm, input, select } from "@inquirer/prompts";

import { CreationTarget } from "../../types/creation";
import { License } from "../../types/license";

import validateInputtedPath from "../validateInputtedPath";
import selectLicense from "../selectLicense";

export default async function addonInitPrompts({
  outputDir,
  isEditorExtension,
  scriptLibrary,
}: {
  outputDir: string;
  isEditorExtension?: boolean;
  scriptLibrary?: { target: CreationTarget; license?: License };
}) {
  const displayType = isEditorExtension ? "Editor extension" : "add-on";

  let hasBp = false;
  let hasRp = false;

  let bp:
    | {
        sourceDir: string;
        scripts?: { language: "javascript" | "typescript" };
      }
    | undefined;
  let rp:
    | {
        sourceDir: string;
      }
    | undefined;

  let target: CreationTarget;

  if (scriptLibrary) {
    target = scriptLibrary.target;
  } else {
    target = await select<CreationTarget>({
      message: `Which version of Minecraft will your ${displayType} target?`,
      choices: [
        { name: "Minecraft (stable)", value: "stable" },
        { name: "Minecraft Preview", value: "preview" },
      ],
    });
  }

  if (!scriptLibrary && !isEditorExtension) {
    const enabledPacks = await checkbox({
      message: `Which packs will your ${displayType} contain?`,
      choices: [
        { name: "Behavior Pack", value: "bp", checked: true },
        { name: "Resource Pack", value: "rp", checked: true },
      ],
      validate: (choices) => (choices.length === 0 ? `Your ${displayType} must include at least one pack.` : true),
    });

    hasBp = enabledPacks.includes("bp");
    hasRp = enabledPacks.includes("rp");
  } else {
    hasBp = true;

    hasRp = await confirm({
      message: `Do you want to include a resource pack in your ${displayType}?`,
      default: false,
    });
  }

  if (hasBp) {
    const sourceDir = await input({
      message: "Behavior pack folder name:",
      default: "BP",
      validate: (value) => validateInputtedPath(outputDir, value),
    });

    bp = { sourceDir };

    const initScripts =
      scriptLibrary ||
      isEditorExtension ||
      (await confirm({
        message: "Do you want to set up behavior pack scripts?",
        default: true,
      }));

    if (initScripts) {
      const language = await select<"javascript" | "typescript">({
        message: "Which scripting language will you use?",
        default: "javascript",
        choices: [
          { name: "JavaScript", value: "javascript" },
          { name: "TypeScript", value: "typescript" },
        ],
      });

      bp.scripts = { language };
    }
  }

  if (hasRp) {
    const sourceDir = await input({
      message: "Resource pack folder name:",
      default: "RP",
      validate: (value) => (value === bp?.sourceDir ? "Pack directories must be unique." : validateInputtedPath(outputDir, value)),
    });

    rp = { sourceDir };
  }

  const name = await input({
    message: "Pack name:",
    default: `My ${displayType}`,
  });

  const description = await input({
    message: "Pack description:",
  });

  const authors = (
    await input({
      message: "Pack authors: (separate names with commas)",
    })
  )
    .split(",")
    .map((author) => author.trim())
    .filter((author) => author); // Remove empty strings

  const url = await input({
    message: "Pack URL:",
  });

  const license = scriptLibrary?.license ?? (await selectLicense());

  return {
    target,
    bp,
    rp,
    name,
    description,
    authors,
    url,
    license,
  };
}
