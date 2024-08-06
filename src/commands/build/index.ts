import { CommandModule } from "yargs";

export default <CommandModule>{
  command: "build",
  describe: "Creates a build of your creation to be published.",
  async handler() {
    (await import("./handler")).handler();
  },
};
