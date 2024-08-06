import { CommandModule } from "yargs";

export default <CommandModule>{
  command: "clean [target]",
  describe: "Clear build and/or development directories.",
  builder: {
    target: {
      choices: ["build", "dev"],
      describe: "Which output directory to remove. If omitted, both the `build` and `development` directories are cleared",
    },
  },
  async handler(args: any) {
    (await import("./handler")).handler(args);
  },
};
