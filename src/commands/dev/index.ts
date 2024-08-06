import { CommandModule } from "yargs";

export default <CommandModule>{
  command: "dev",
  aliases: ["develop"],
  describe: "Creates a development build of your creation and rebuilds upon each change.",
  async handler() {
    (await import("./handler")).handler();
  },
};
