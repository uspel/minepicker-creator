import chalk from "chalk";

import message from "../message";
import Data from "../../data";

export default async function updatePackageMessage() {
  try {
    const res = await fetch(`https://registry.npmjs.org/${Data.package.name}/latest`);

    if (!res.ok) return;

    const json: unknown = await res.json();

    if (!json || typeof json !== "object" || !("version" in json)) return;

    const { version } = json;

    if (Data.package.version === version) return;

    message(
      "A new version of the Minepicker Creator CLI is available. Please update by running the following command:\n" +
        chalk.reset(`  npm install -g ${Data.package.name}@latest`) +
        "\n",
      "information"
    );
  } catch {}
}
