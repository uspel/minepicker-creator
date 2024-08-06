import { statSync, readdirSync } from "fs";
import { join } from "path";

export function fileExists(filePath: string) {
  try {
    const stat = statSync(filePath);
    return stat.isFile();
  } catch {
    return false;
  }
}

export function directoryExists(directoryPath: string) {
  try {
    const stat = statSync(directoryPath);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

export function getFiles(directoryPath: string) {
  const files: string[] = [];
  const items = readdirSync(directoryPath, { withFileTypes: true });

  for (const item of items) {
    const itemPath = join(directoryPath, item.name);

    if (item.isDirectory()) {
      files.push(...getFiles(itemPath));
    } else {
      files.push(itemPath);
    }
  }

  return files;
}
