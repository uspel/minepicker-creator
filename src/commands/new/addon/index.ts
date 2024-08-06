import { existsSync, mkdirSync } from "fs";
import { v4 as uuid } from "uuid";
import { join } from "path";

import { getComMojangPath } from "../../../utils/getAbsolutePath";
import prettyPath from "../../../utils/prettyPath";
import message from "../../../utils/message";

import addonInitPrompts from "../../../prompts/init/addon";

import vscodeDirectory from "../vscodeDirectory";
import vscodeLaunch from "./vscodeLaunch";
import vscodeSettings from "../vscodeSettings";

import rpManifest from "./rpManifest";
import bpManifest from "./bpManifest";
import bpScripts from "./bpScripts";

import licenseFile from "../license";
import gitignore from "../gitignore";
import creation from "./creation";

import { CreationTarget } from "../../../types/creation";
import { License } from "../../../types/license";

export type RP = {
  uuid: string;
  devDir: string;
  sourceDir: string;
};

export type BP = {
  uuid: string;
  devDir: string;
  sourceDir: string;
  scripts?: {
    uuid: string;
    entry: string;
  };
};

export default async function initAddon({
  outputDir = process.cwd(),
  isEditorExtension,
  scriptLibrary,
}: {
  outputDir?: string;
  isEditorExtension?: boolean;
  scriptLibrary?: {
    target: CreationTarget;
    license?: License;
  };
}) {
  let result: { scriptsDir?: string } = {};

  const answers = await addonInitPrompts({
    outputDir,
    isEditorExtension,
    scriptLibrary,
  });

  const { target, name, description, authors, url, license } = answers;
  const licenseId = license?.spdx_id ?? undefined;

  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
    message(`Created *${prettyPath(outputDir, "relative")}*`, "addition");
  }

  const rp: RP | undefined = answers.rp
    ? {
        uuid: uuid(),
        devDir: getDevDirectoryPath("rp"),
        sourceDir: answers.rp.sourceDir,
      }
    : undefined;

  const bp: BP | undefined = answers.bp
    ? {
        uuid: uuid(),
        devDir: getDevDirectoryPath("bp"),
        sourceDir: answers.bp.sourceDir,
        scripts: answers.bp.scripts
          ? {
              uuid: uuid(),
              entry: "index." + (answers.bp.scripts.language === "javascript" ? "js" : "ts"),
            }
          : undefined,
      }
    : undefined;

  vscodeDirectory(outputDir);
  if (bp?.scripts) {
    vscodeLaunch({
      target,
      outputDir,
      bpDevDir: bp.devDir,
      bpScriptsUuid: bp.scripts.uuid,
    });
  }
  vscodeSettings(outputDir);

  if (bp) {
    const { sourceDir, uuid, scripts } = bp;

    const packOutputDir = join(outputDir, sourceDir);

    mkdirSync(packOutputDir, { recursive: true });
    message(`Created *${prettyPath(packOutputDir, "relative")}*`, "addition");

    if (bp.scripts) {
      const scriptsDir = join(packOutputDir, "scripts");

      bpScripts({
        outputDir: scriptsDir,
        entry: bp.scripts.entry,
      });

      result = { scriptsDir };
    }

    await bpManifest({
      outputDir: packOutputDir,
      name,
      description,
      authors,
      license: licenseId,
      url,
      uuid,
      dependencyUuid: rp?.uuid,
      scripts,
      isEditorExtension,
    });
  }

  if (rp) {
    const { sourceDir, uuid } = rp;

    const packOutputDir = join(outputDir, sourceDir);

    mkdirSync(packOutputDir, { recursive: true });
    message(`Created *${prettyPath(packOutputDir, "relative")}*`, "addition");

    await rpManifest({
      outputDir: packOutputDir,
      name,
      description,
      authors,
      license: licenseId,
      url,
      uuid,
      dependencyUuid: bp?.uuid,
    });
  }

  gitignore(outputDir);

  if (!scriptLibrary && license) licenseFile({ license, outputDir });

  await creation({
    target,
    outputDir,
    rp,
    bp,
    isEditorExtension,
  });

  return result;

  function getDevDirectoryPath(type: "rp" | "bp", attemptIndex: number = 0) {
    if (!process.env.LOCALAPPDATA) return join("dev", type.toUpperCase());

    let directoryName = `${name} ${type.toUpperCase()}`;
    if (attemptIndex) directoryName += ` (${attemptIndex})`;

    const packsDirectory = type === "bp" ? "development_behavior_packs" : "development_resource_packs";
    const directoryPath = join(packsDirectory, directoryName);
    const alreadyExistsInComMojang = existsSync(getComMojangPath(target, directoryPath));

    if (alreadyExistsInComMojang) return getDevDirectoryPath(type, attemptIndex + 1);

    return directoryPath;
  }
}
