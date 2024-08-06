import { join } from "path";

import { directoryExists, fileExists } from "../utils/fs";

export default function validateInputtedPath(...paths: string[]) {
  const path = join(...paths);

  if (directoryExists(path)) return "A folder with that name already exists. Either delete it or pick a different name.";
  else if (fileExists(path)) return "A file with that name already exists. Either delete it or pick a different name.";

  return true;
}
