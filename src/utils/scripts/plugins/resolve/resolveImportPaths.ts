import { resolve, join, dirname, parse } from "path";
import { realpathSync } from "fs";

import { ResolutionError, ResolutionErrorCode, isRelativeModulePath } from "./utils";
import { fileExists, directoryExists } from "../../../fs";
import prettyPath from "../../../prettyPath";

export interface Options {
  baseDir: string;
  extensions: string[];
  libraryDirectories: string[];
  preserveSymlinks: boolean;
}

export default function resolveImportPaths(importSpecifierList: string[], options: Options) {
  for (let i = 0; i < importSpecifierList.length; i++) {
    const location = resolvePath(importSpecifierList[i]!, options);

    if (location) return location;
  }

  return null;
}

function resolvePath(path: string, options: Options) {
  // ensure that `baseDir` is an absolute path at this point, resolving against the process' current working directory
  const start = maybeRealpath(resolve(options.baseDir), options);

  let resolvedPath;

  if (isRelativeModulePath(path)) {
    let res = resolve(start, path);
    if (path === "." || path === ".." || path.slice(-1) === "/") res += "/";
    resolvedPath = resolvePathAsFileOrDirectory(res, options);
  } else {
    resolvedPath = resolvePathAsLibrary(path, start, options);
  }

  if (resolvedPath) return maybeRealpath(resolvedPath, options);

  const error = new ResolutionError(
    `Could not resolve module "${path}" from directory "${prettyPath(options.baseDir, "relative")}"`,
    ResolutionErrorCode.ModuleNotFound
  );

  throw error;
}

function resolvePathAsFileOrDirectory(path: string, options: Options) {
  return resolvePathAsFile(path, options) ?? resolvePathAsDirectory(path, options);
}

// Try to resolvePath the import as a file with each valid extension e.g. *.js
function resolvePathAsFile(path: string, { extensions }: Options) {
  if (fileExists(path)) return path;

  for (const extension of extensions) {
    const file = path + extension;

    if (fileExists(file)) return file;
  }

  return null;
}

// Try to resolvePath the import as a directory's index file
function resolvePathAsDirectory(path: string, options: Options) {
  const indexPath = join(path, "index");

  return resolvePathAsFile(indexPath, options);
}

// Try to resolvePath the import as a Minepicker library
function resolvePathAsLibrary(path: string, start: string, options: Options) {
  const libraryPathCandidates = getLibraryCandidates(path, start, options);

  for (const path of libraryPathCandidates) {
    if (!directoryExists(dirname(path))) continue;

    return resolvePathAsFileOrDirectory(path, options);
  }

  return null;
}

function realpath(path: string) {
  try {
    return realpathSync(path);
  } catch (error: any) {
    if (error.code !== "ENOENT") throw error;
  }
  return path;
}

function maybeRealpath(path: string, options: Options) {
  if (!options.preserveSymlinks) return realpath(path);

  return path;
}

function getLibraryCandidates(path: string, start: string, { libraryDirectories }: Options) {
  let prefix = "/";
  if (/^[a-z]:/i.test(start)) {
    prefix = "";
  } else if (/^\\\\/.test(start)) {
    prefix = "\\\\";
  }

  const modulePaths = [start];
  let parsed = parse(start);

  while (parsed.dir !== modulePaths[modulePaths.length - 1]) {
    modulePaths.push(parsed.dir);
    parsed = parse(parsed.dir);
  }

  const moduleDirs = [];

  for (const modulePath of modulePaths) {
    const pathModuleDirectories = libraryDirectories.map((libraryDirectory) => resolve(prefix, modulePath, libraryDirectory, path));

    moduleDirs.push(...pathModuleDirectories);
  }

  return moduleDirs;
}
