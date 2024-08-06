import { CommandModule } from "yargs";

export default <CommandModule>{
  command: "new",
  describe: "Sets up a new Minepicker creation project in the current directory.",
  async handler() {
    (await import("./handler")).handler();
  },
};
