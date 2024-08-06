import { rmSync, mkdirSync, copyFileSync } from "fs";
import { basename, join, relative } from "path";
import { watch as watchFiles } from "chokidar";
import { compareSync } from "dir-compare";

import { directoryExists } from "../fs";
import prettyPath from "../prettyPath";
import message from "../message";

import generateContentsFile, { contentsFileName } from "./generateContents";
import generateTexturesListFile, { texturesDirectoryName, texturesListFileName } from "./generateTexturesList";

export default function syncPack(
  {
    inputDir,
    outputDir,
    exclude = [],
    generateContents,
    generateTexturesList,
    watch,
  }: {
    inputDir: string;
    outputDir: string;
    exclude?: string[];
    generateContents?: boolean;
    generateTexturesList?: boolean;
    watch?: boolean;
  },
  scope: string
) {
  if (!directoryExists(outputDir)) mkdirSync(outputDir, { recursive: true });

  if (generateContents) exclude = exclude.concat(contentsFileName);
  if (generateTexturesList) exclude = exclude.concat(texturesDirectoryName + "/" + texturesListFileName);

  // --------------------
  //    File Functions
  // --------------------

  // CREATE FILE OR DIRECTORY
  function create(type: string, ...paths: string[]) {
    const path = join(...paths);
    const inputPath = join(inputDir, path);
    const outputPath = join(outputDir, path);

    if (type === "file") copyFileSync(inputPath, outputPath);
    else mkdirSync(outputPath, { recursive: true });

    message(`Created *${prettyPath(path)}*`, "addition", scope);
  }

  // REMOVE FILE OR DIRECTORY
  function remove(...paths: string[]) {
    const path = join(...paths);
    const outputPath = join(outputDir, path);

    rmSync(outputPath, { force: true, recursive: true });
    message(`Deleted *${prettyPath(path)}*`, "deletion", scope);
  }

  // UPDATE FILE
  function updateFile(...paths: string[]) {
    const path = join(...paths);
    const inputPath = join(inputDir, path);
    const outputPath = join(outputDir, path);

    copyFileSync(inputPath, outputPath);
    message(`Updated *${prettyPath(path)}*`, "update", scope);
  }

  // --------------------
  //    Initial Sync
  // --------------------

  const result = compareSync(inputDir, outputDir, { compareDate: true, excludeFilter: exclude.map((path) => "/" + path).join(",") });

  for (const difference of result.diffSet!) {
    const { relativePath, state, type1: inputType, type2: outputType, name1: inputName, name2: outputName } = difference;
    const name = inputName ?? outputName!;

    try {
      switch (state) {
        // File/directory only in input - should be created
        case "left":
          create(inputType, relativePath, name);
          break;
        // File/directory only in output - should be removed
        case "right":
          remove(relativePath, name);
          break;
        // Files are different - should be updated
        case "distinct":
          updateFile(relativePath, name);
          break;
      }
    } catch {}
  }

  // --------------------
  //    Generate Files
  // --------------------

  // Generate contents.json
  if (generateContents) generateContentsFile(outputDir);

  // Generate textures/textures_list.json
  if (generateTexturesList) generateTexturesListFile(outputDir, scope);

  if (!watch) return;

  // --------------------
  //       Watcher
  // --------------------

  const watcher = watchFiles(inputDir, {
    persistent: true,
    ignoreInitial: true,
    usePolling: true,
    interval: 500,
    ignored: exclude.map((ignoredPath) => join(inputDir, ignoredPath)),
  });

  function handleInputDeleted() {
    message(`Source directory deleted at *${prettyPath(inputDir, "relative")}*.`, "failure", scope);
    watcher.close();
  }

  watcher.on("all", (event, path) => {
    const relativePath = relative(inputDir, path);

    const type = event.endsWith("Dir") ? "directory" : "file";

    try {
      switch (event) {
        case "add":
        case "addDir":
          create(type, relativePath);
          break;
        case "unlink":
        case "unlinkDir":
          if (type === "directory" && !directoryExists(inputDir)) handleInputDeleted();
          remove(relativePath);
          break;
        case "change":
          updateFile(relativePath);
          break;
      }
    } catch {}

    // --------------------
    //    Generate Files
    // --------------------

    if (event !== "change") {
      // Generate contents.json
      if (generateContents) generateContentsFile(outputDir);

      // Generate textures/textures_list.json
      const isInTexturesDir = basename(relativePath) === texturesDirectoryName;
      if (generateTexturesList && isInTexturesDir) generateTexturesListFile(outputDir);
    }
  });
}
