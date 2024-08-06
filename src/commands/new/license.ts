import { writeFileSync } from "fs";
import { join } from "path";

import prettyPath from "../../utils/prettyPath";
import message from "../../utils/message";
import { License } from "../../types/license";

export default async function ({ license, outputDir = process.cwd() }: { license: License; outputDir?: string }) {
  const { key, body } = license;

  const licenseFileName = key === "unlicense" ? "UNLICENSE" : key === "gpl-3.0" ? "COPYING" : "LICENSE";

  const outputFile = join(outputDir, licenseFileName);
  writeFileSync(outputFile, body);

  message(`Created *${prettyPath(outputFile, "relative")}* (remember to fill in your details)`, "addition");
}
