import { LogLevel, OutputOptions, RollupLog, RollupOptions, rollup } from "rollup";
import { watch as watchFiles } from "chokidar";
import { rmSync, symlinkSync, existsSync } from "fs";
import { dirname, join } from "path";

import terser from "@rollup/plugin-terser";
import typescript from "./plugins/typescript";
import resolve from "./plugins/resolve";
import json from "@rollup/plugin-json";

import prettyPath from "../prettyPath";
import message from "../message";
import Data from "../../data";

import getNativeDependencies from "./nativeDependencies/get";
import { createScriptLibraryConfig } from "./libraryConfig";
import { MinecraftWebSocketServer } from "./websocket";
import archiveLibrary from "./archiveLibrary";

interface ScriptOptions {
  /** @default process.cwd() */
  baseDir?: string;
  inputDir: string;
  outputDir: string;
  entries: string[];
  bundle?: boolean;
  minify?: boolean;
  /** @default true */
  sourceMap?: boolean;
  /** @default true */
  treeShake?: boolean;
  dependencies: Record<string, string>;
  /** @default true */
  resolveDependencies?: boolean;
  emitDependenciesSymlink?: boolean;
  emitLibraryArchive?: boolean;
  emitLibraryConfig?: boolean;
  watch?: boolean;
  websocket?: boolean | { port: number };
  onBuild?(): void;
}

export default function rollupScripts(
  {
    baseDir = process.cwd(),
    inputDir,
    outputDir,
    entries,
    bundle,
    minify,
    sourceMap = true,
    treeShake = true,
    dependencies,
    resolveDependencies = true,
    emitDependenciesSymlink,
    emitLibraryArchive,
    emitLibraryConfig,
    watch,
    websocket,
    onBuild,
  }: ScriptOptions,
  scope: string
) {
  const librariesDir = join(baseDir, Data.scriptLibrariesDirectoryName);

  const cleanOutputDir = () => rmSync(outputDir, { force: true, recursive: true });

  const websocketPort = typeof websocket === "object" ? websocket.port : Data.defaultAutomaticReloadWebsocketPort;
  const websocketServer = websocket ? new MinecraftWebSocketServer(websocketPort) : undefined;

  const nativeDependencies = getNativeDependencies(dependencies, librariesDir);
  const nativeDependencyNames = Object.keys(nativeDependencies);

  const plugins = [
    resolve({
      resolveLibraries: resolveDependencies,
    }),
    typescript(baseDir),
    json(),
  ];

  if (minify) plugins.push(terser());

  for (const entry of entries) {
    const rollupOptions: RollupOptions = {
      external: nativeDependencyNames,
      input: join(inputDir, entry),
      plugins,
      preserveSymlinks: false,
      treeshake: treeShake,
      onLog: handleLog,
    };

    const outputOptions: OutputOptions = {
      dir: join(outputDir, dirname(entry)),
      format: "esm",
      sourcemap: sourceMap,
    };

    if (!bundle) {
      outputOptions.preserveModules = true;
      outputOptions.preserveModulesRoot = inputDir;
    }

    let isBuilding = false;

    async function triggerBuild() {
      isBuilding = true;

      try {
        const build = await rollup(rollupOptions);
        await build.write(outputOptions);

        message("Successfully built scripts!", "success", scope);
        websocketServer?.reloadClients();

        if (emitLibraryConfig) await createScriptLibraryConfig(outputDir, dependencies, scope);

        const dependenciesSymlinkPath = join(outputDir, Data.scriptLibrariesDirectoryName);

        if (emitDependenciesSymlink && !existsSync(dependenciesSymlinkPath)) {
          symlinkSync(librariesDir, dependenciesSymlinkPath);
        }

        if (emitLibraryArchive) await archiveLibrary(outputDir, scope);

        onBuild?.();

        isBuilding = false;
        return true;
      } catch (e) {
        handleRollupError(e, scope);

        isBuilding = false;
        return false;
      }
    }

    cleanOutputDir();

    message(`Building scripts from *${prettyPath(entry)}*...`, "update", scope);

    triggerBuild().then(() => {
      if (!watch) return;

      const watcher = watchFiles(join(inputDir, "**/*.{js,ts,json}"), {
        ignored: librariesDir,
        ignoreInitial: true,
        interval: 500,
        persistent: true,
        usePolling: true,
      });

      watcher?.on("all", () => {
        if (isBuilding) return;
        cleanOutputDir();

        message(`Rebuilding scripts from *${prettyPath(entry)}*...`, "update", scope);

        triggerBuild();
      });
    });
  }

  function handleLog(level: LogLevel, log: RollupLog) {
    if (level === "info") message(log.message, "information", scope);
    else if (level === "warn") message(log.message, "warning", scope);
  }
}

const errorSuffixesToRemove = [
  " (Note that you need @rollup/plugin-json to import JSON files)",
  " (Note that you need plugins to import files that are not JavaScript)",
];

function handleRollupError(e: unknown, scope: string) {
  if (!(e instanceof Error)) throw e;

  let { name, message: msg } = e;

  if (name === "RollupError") name = "Compilation Error";
  msg = msg.replace("[plugin Typescript]", "[TypeScript]");

  for (const suffix of errorSuffixesToRemove) {
    if (!msg.endsWith(suffix)) continue;

    msg = msg.substring(0, msg.length - suffix.length);
    break;
  }

  message(`${name}: ${msg}`, "failure", scope);
}
