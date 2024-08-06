#!/usr/bin/env node
import "./utils/package/checkNodeVersion";

import updatePackageMessage from "./utils/package/updatePackage";
import message from "./utils/message";

process.removeAllListeners("warning");

message("Minepicker Creator CLI\n");
await updatePackageMessage();

import("./utils/package/registerCommands");
