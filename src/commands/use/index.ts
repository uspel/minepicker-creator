import { CommandModule } from "yargs";

export default <CommandModule>{
  command: "use [libraryName] [versionRange]",
  describe:
    "Installs a script library in the current creation. If no arguments are provided, the script dependencies listed in `creation.json` will be installed.",
  builder: {
    libraryName: {
      type: "string",
      describe: "The Minepicker ID of the script library you would like to use. If omitted, all dependencies in the `creation.json` config are installed.",
    },
    versionRange: {
      type: "string",
      describe:
        "Minepicker will install the lastest version of the script library satisfying the semantic version range supplied. If omitted, the latest full release of the library will be installed.",
    },
  },
  async handler(args: any) {
    (await import("./handler")).handler(args);
  },
};
