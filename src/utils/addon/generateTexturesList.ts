import { writeFile } from "fs/promises";
import { join } from "path";

import prettifyJson from "../prettifyJson";
import { directoryExists, getFiles } from "../fs";
import prettyPath from "../prettyPath";
import message from "../message";

export const texturesDirectoryName = "textures";
export const texturesListFileName = "textures_list.json";

const textureFileExtensions = ["tga", "png", "jpg", "jpeg"];

const textureExtensionPattern = new RegExp(`\\.(${textureFileExtensions.join("|")})$`);

export default async function generateTexturesList(inputPath: string, scope?: string) {
  const texturesDir = join(inputPath, texturesDirectoryName);

  if (!directoryExists(texturesDir)) return;

  const list = new Set<string>();
  const duplicateTexturePaths = new Set<string>();

  for (const filePath of getFiles(texturesDir)) {
    const extensionMatch = filePath.match(textureExtensionPattern)?.[0];
    if (!extensionMatch) continue;

    const filePathStripped = filePath.substring(inputPath.length, filePath.length - extensionMatch.length);

    const path = prettyPath(filePathStripped);

    if (list.has(path)) {
      if (duplicateTexturePaths.has(path)) continue;

      message(`Multiple textures with path *${path}*. Texture files are found by Minecraft in the following order: .tga, .png, .jpg, .jpeg.`, "warning", scope);

      duplicateTexturePaths.add(path);
      continue;
    }

    list.add(path);
  }

  const texturesListFilePath = join(texturesDir, texturesListFileName);
  await writeFile(texturesListFilePath, await prettifyJson(Array.from(list), 100));
}
