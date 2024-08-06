import { join, resolve } from "path";
import { homedir } from "os";

import packageJson from "../package.json";

function microsoftPackageName(appName: string) {
  return `Microsoft.${appName}_8wekyb3d8bbwe`;
}

export default class Data {
  static package = packageJson;

  static creationConfigFileName = "creation.json";
  static creationConfigFilePath = join(process.cwd(), this.creationConfigFileName);

  static defaultCreationLicense = "MIT";

  static minecraftPackageName = microsoftPackageName("MinecraftUWP");
  static minecraftPreviewPackageName = microsoftPackageName("MinecraftWindowsBeta");

  static defaultBehaviorPackScriptDebuggerPort = 19144;
  static defaultAutomaticReloadWebsocketPort = 19145;

  static packManifestFileName = "manifest.json";

  static scriptLibraryArchiveFileName = "library";
  static scriptLibraryConfigFileName = "library.json";
  static scriptLibrariesDirectoryName = "node_modules"; // Libraries will be installed in "node_modules" to keep compatibility with TypeScript (and therefore IntelliSense in VSCode)
  static scriptLibrariesCacheDirectoryPath = join(homedir(), ".minepicker/script_libraries");

  static scriptTslibPath = resolve(import.meta.dirname, "../node_modules/tslib");

  static scriptTsconfigFileName = "tsconfig.json";

  static scriptEngineTypesFileName = "engine.d.ts";
  static scriptEngineTypesFilePath = resolve(import.meta.dirname, `../lib/${this.scriptEngineTypesFileName}`);

  static defaultCreationGitignore = `/build
/dev

node_modules
`;

  static defaultCreationVscodeSettings = `{
  "files.associations": {
    "*.json": "jsonc"
  },
  "json.schemas": [
    {
      "fileMatch": ["${this.creationConfigFileName}"],
      "url": "https://creator.minepicker.com/schemas/creation.json"
    }
  ]
}
`;

  static defaultScript = `console.warn("There's nothing here... yet!");
`;

  static defaultBehaviorPackScriptsTsconfig = `{
  "compilerOptions": {
    // Strictness
    "strict": true,
    "noUncheckedIndexedAccess": true,
    // We don't recommend changing any of the following options
    "allowJs": true,
    "resolveJsonModule": true,
    // Built files will be emitted by Minepicker, not the TypeScript compiler
    "noEmit": true,
    // Minecraft JS engine uses ES2022
    "lib": ["ES2022"],
    "target": "ES2022",
    "types": ["engine"],
    // Allow imports without file extensions e.g. 'import "./test";'
    "moduleResolution": "Bundler",
    "module": "ES2020"
  },
  "exclude": ["${this.scriptLibrariesDirectoryName}"] // Skip checking external libraries
}
`;
  static defaultScriptLibraryTsconfig = `{
  "compilerOptions": {
    // Strictness
    "strict": true,
    "noUncheckedIndexedAccess": true,
    // We don't recommend changing any of the following options
    "allowJs": true,
    "declaration": true,
    "resolveJsonModule": true,
    // Built files will be emitted by Minepicker, not the TypeScript compiler
    "noEmit": true,
    // Minecraft JS engine uses ES2022
    "lib": ["ES2022"],
    "target": "ES2022",
    "types": ["engine"],
    // Allow imports without file extensions e.g. 'import "./test";'
    "moduleResolution": "Bundler",
    "module": "ES2020"
  },
  "exclude": ["${this.scriptLibrariesDirectoryName}"] // Skip checking external libraries
}
`;
}
