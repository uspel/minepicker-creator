import { realpathSync } from "fs";

import { fileExists } from "../../../fs";

export enum ResolutionErrorCode {
  ModuleNotFound = "MODULE_NOT_FOUND",
}

export class ResolutionError extends Error {
  name = "Resolution Error";
  code: ResolutionErrorCode;

  constructor(message: string, code: ResolutionErrorCode) {
    super(message);
    this.code = code;
  }
}

export function normalizeInput(input: string[] | Record<any, string> | string) {
  if (Array.isArray(input)) {
    return input;
  } else if (typeof input === "object") {
    return Object.values(input);
  }

  return [input];
}

export function resolveSymlink(path: string) {
  return fileExists(path) ? realpathSync(path) : path;
}

export function isRelativeModulePath(path: string) {
  const relativeModulePattern = /^(\.\.?(\/|$)|([a-z]:)?[/\\])/i;

  return relativeModulePattern.test(path);
}
