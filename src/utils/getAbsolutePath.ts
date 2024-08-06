import { isAbsolute, join } from "path";

import Data from "../data";
import message from "./message";
import { CreationTarget } from "../types/creation";

function prefixNotSupported(): never {
  message("This platform does not support the Minecraft data directories.", "failure");
  process.exit(1);
}

export function getLocalAppDataRelativeComMojangPath(target: CreationTarget, ...path: string[]) {
  const packageName = target === "stable" ? Data.minecraftPackageName : Data.minecraftPreviewPackageName;

  return join("Packages", packageName, "LocalState/games/com.mojang", ...path);
}

export function getComMojangPath(target: CreationTarget, ...path: string[]) {
  const localAppDataPath = process.env.LOCALAPPDATA;

  if (!localAppDataPath) prefixNotSupported();

  return join(localAppDataPath, getLocalAppDataRelativeComMojangPath(target), ...path);
}

export default function getAbsolutePath(path: string) {
  if (path.startsWith("minecraft:")) {
    path = getComMojangPath("stable", path.substring(10));
  } else if (path.startsWith("minecraft-preview:")) {
    path = getComMojangPath("preview", path.substring(18));
  }

  return isAbsolute(path) ? path : join(process.cwd(), path);
}
