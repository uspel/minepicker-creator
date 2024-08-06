import { CommandModule } from "yargs";

export default <CommandModule>{
  command: "refresh",
  describe: "Refreshes the type definitions for native script library pre-releases, including `-beta` versions and release candidates.",
  async handler() {
    (await import("./handler")).handler();
  },
};
