import { readFileSync } from "fs";
import json5 from "json5";

import { PackManifest } from "../../../types/manifest";
import { fileExists } from "../../fs";

export default function getPackManifest(manifestPath: string) {
  if (!fileExists(manifestPath)) return;

  try {
    const manifest: PackManifest = json5.parse(readFileSync(manifestPath, { encoding: "utf-8" }));

    if (manifest && typeof manifest === "object") return manifest;
  } catch {}
}
