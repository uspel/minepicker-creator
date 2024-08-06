import { select, Separator } from "@inquirer/prompts";

import octokit from "../apis/octokit";
import Data from "../data";

type Choice = {
  name: string;
  value: string;
};

export default async function selectLicense() {
  try {
    const { data: licenses } = await octokit.request("GET /licenses");

    const choices: (Choice | Separator)[] = [new Separator()];

    for (const license of licenses) {
      if (license.spdx_id === Data.defaultCreationLicense) {
        choices.unshift({ name: license.name, value: license.key });
      } else {
        choices.push({ name: license.name, value: license.key });
      }
    }

    const licenseId = await select({
      message: "Creation license: (https://choosealicense.com)",
      choices,
    });

    const { data: license } = await octokit.request("GET /licenses/{license}", { license: licenseId });

    return license;
  } catch {}
}
