import { Plugin } from "rollup";
import { dirname } from "path";

import { isRelativeModulePath } from "./utils";
import resolveImportPaths from "./resolveImportPaths";
import Data from "../../../../data";

const defaultOptions = {
  extensions: [".js", ".ts", ".json"],
  resolveLibraries: true,
  libraryDirectories: [
    Data.scriptLibrariesDirectoryName, // Library dependencies will be installed in "node_modules" to keep compatibility with TypeScript
  ],
};

const pluginName = "minepicker-module-resolution";

export function resolve(options: Partial<typeof defaultOptions> = {}): Plugin {
  const { extensions, resolveLibraries, libraryDirectories } = Object.assign(defaultOptions, options);
  let preserveSymlinks: boolean;

  const resolveModule = (importee: string, importer: string) => {
    // Strip query params from import
    const [importPath, params] = importee.split("?");
    const importSuffix = params ? `?${params}` : "";
    importee = importPath!;

    const baseDir = dirname(importer);

    // Is a library
    if (!isRelativeModulePath(importee)) {
      const parts = importee.split(/[/\\]+/);
      let libraryName = parts.shift()!;

      // Scoped packages
      if (libraryName[0] === "@" && parts.length > 0) {
        libraryName += `/${parts.shift()}`;
      }

      if (!resolveLibraries) return false;
    }

    const importPaths = [importee];

    // TypeScript files may import .js to refer to .ts
    if (importer.endsWith(".ts") && importee.endsWith(".js") && extensions.includes(".ts")) {
      importPaths.push(importee.slice(0, -".js".length) + ".ts");
    }

    const resolved = resolveImportPaths(importPaths, {
      baseDir,
      extensions,
      preserveSymlinks,
      libraryDirectories,
    });

    // console.log(`Resolved "${resolved}"`);

    if (!resolved) return null;

    return {
      id: resolved + importSuffix,
    };
  };

  return {
    name: pluginName,

    buildStart(buildOptions) {
      ({ preserveSymlinks } = buildOptions);
    },

    async resolveId(importee, importer, resolveOptions) {
      // Ignore IDs with null character, these belong to other plugins
      if (/\0/.test(importee) || !importer) return null;

      let { custom = {} } = resolveOptions;
      const alreadyResolved = custom[pluginName]?.resolved;

      if (alreadyResolved) return alreadyResolved;

      const resolved = resolveModule(importee, importer);

      if (!resolved) return resolved;

      // This way, plugins may attach additional meta information to the resolved id or make it external
      const reresolved = await this.resolve(resolved.id, importer, {
        ...resolveOptions,
        skipSelf: false,
        custom: {
          ...custom,
          [pluginName]: {
            ...custom[pluginName],
            resolved,
            importee,
          },
        },
      });

      if (!reresolved) return resolved;

      // Handle plugins that manually make the result external
      if (reresolved.external) return false;

      // Allow other plugins to take over resolution. Rollup core will not change the ID if it corresponds to an existing file
      if (reresolved.id !== resolved.id) return reresolved;

      // Pass on meta information added by other plugins
      return { ...resolved, meta: reresolved.meta };
    },
  };
}

export default resolve;
