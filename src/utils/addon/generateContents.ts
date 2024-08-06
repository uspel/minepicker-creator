import { writeFile } from "fs/promises";
import { join } from "path";

import prettifyJson from "../prettifyJson";
import prettyPath from "../prettyPath";
import { getFiles } from "../fs";

export const contentsFileName = "contents.json";

export default async function generateContents(inputPath: string) {
  const files = getFiles(inputPath);

  const content: { path: string }[] = [];

  for (const file of files) {
    const path = prettyPath(file.substring(inputPath.length));
    if (path === contentsFileName) continue;

    content.push({ path });
  }

  const contentsFilePath = join(inputPath, contentsFileName);
  await writeFile(contentsFilePath, await prettifyJson({ content }, 100));
}
