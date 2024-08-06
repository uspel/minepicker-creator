import { v4 as uuidV4 } from "uuid";
import { writeFileSync } from "fs";
import path from "path";

import { PackManifest } from "../../../types/manifest";
import prettifyJson from "../../../utils/prettifyJson";
import prettyPath from "../../../utils/prettyPath";
import message from "../../../utils/message";
import Data from "../../../data";

export default async function ({
  outputDir,
  name,
  description,
  authors,
  license,
  url,
  isEditorExtension,
  uuid,
  dependencyUuid,
  scripts,
}: {
  outputDir: string;
  name: string;
  description: string;
  authors: string[];
  license?: string;
  url: string;
  uuid: string;
  dependencyUuid?: string;
  scripts?: {
    entry: string;
    uuid: string;
  };
  isEditorExtension?: boolean;
}) {
  const manifest: PackManifest = {
    format_version: 2,
    header: {
      name,
      description,
      uuid,
      version: [1, 0, 0],
      min_engine_version: [1, 21, 0],
    },
    metadata: {
      authors,
      license,
      url: url || undefined,
      generated_with: {
        [Data.package.name]: [Data.package.version],
      },
    },
    modules: [
      {
        type: "data",
        uuid: uuidV4(),
        version: [1, 0, 0],
      },
    ],
  };

  if (dependencyUuid) {
    manifest.dependencies = [
      {
        uuid: dependencyUuid,
        version: [1, 0, 0],
      },
    ];
  }

  if (scripts) {
    manifest.modules.push({
      type: "script",
      language: "javascript",
      entry: scripts.entry,
      uuid: scripts.uuid,
      version: [1, 0, 0],
    });
  }

  if (isEditorExtension) {
    manifest.capabilities = ["editorExtension"];
  }

  const prettifiedManifestString = await prettifyJson(manifest, 70);

  const outputFilePath = path.join(outputDir, Data.packManifestFileName);

  writeFileSync(outputFilePath, prettifiedManifestString);
  message(`Created *${prettyPath(outputFilePath, "relative")}*`, "addition");
}
