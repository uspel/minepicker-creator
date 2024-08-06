import { CommandModule } from "yargs";

export default <CommandModule>{
  command: "remove <libraryName>",
  describe: "Removes a script library from your creation.",
  builder: {
    libraryName: {
      type: "string",
      describe: "The Minepicker ID of the script library you would like to remove.",
    },
  },
  async handler(args: any) {
    (await import("./handler")).handler(args);
  },
};
