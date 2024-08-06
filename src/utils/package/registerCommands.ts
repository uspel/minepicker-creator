import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import commands from "../../commands";

const argv = yargs(hideBin(process.argv)).scriptName("minepicker").usage("Usage: minepicker <command> [options]");

for (const command of commands) argv.command(command);

argv.wrap(argv.terminalWidth()).strict().parse();
